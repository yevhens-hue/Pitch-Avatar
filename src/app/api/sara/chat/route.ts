import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// ── Clients ───────────────────────────────────────────────────────────────────
let _openai: OpenAI | null = null;
const getOpenAI = (): OpenAI => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
};

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use service role for RAG search (bypasses RLS to always find global chunks)
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ── Config ────────────────────────────────────────────────────────────────────
const RAG_ENABLED = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.OPENAI_API_KEY;
const MATCH_THRESHOLD = 0.70;   // cosine similarity cutoff
const MATCH_COUNT = 5;           // top-k chunks to retrieve
const MAX_CONTEXT_CHARS = 3000;  // soft cap for injected RAG context
const LLM_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 600;

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RagChunk {
  id: string;
  source_name: string;
  source_type: string;
  content: string;
  similarity: number;
}

// ── System Prompt ─────────────────────────────────────────────────────────────
function loadSystemPrompt(): string {
  try {
    const promptPath = path.join(process.cwd(), 'docs', 'sara', 'system_prompt.md');
    return fs.readFileSync(promptPath, 'utf8');
  } catch {
    return 'You are Sara, the official Pitch Avatar AI assistant. Be helpful, concise, and action-oriented.';
  }
}

// ── RAG: embed query ──────────────────────────────────────────────────────────
async function embedQuery(query: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    encoding_format: 'float',
  });
  return res.data[0].embedding;
}

// ── RAG: vector search ────────────────────────────────────────────────────────
async function retrieveChunks(
  queryEmbedding: number[],
  projectId?: string
): Promise<RagChunk[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('match_sara_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
    p_project_id: projectId ?? null,
  });

  if (error) {
    console.error('[Sara RAG] match_sara_chunks error:', error.message);
    return [];
  }

  return (data as RagChunk[]) ?? [];
}

// ── Build RAG context string ──────────────────────────────────────────────────
function buildRagContext(chunks: RagChunk[]): string {
  if (!chunks.length) return '';

  let context = '';
  for (const chunk of chunks) {
    const snippet = `[${chunk.source_name}]\n${chunk.content}\n\n`;
    if (context.length + snippet.length > MAX_CONTEXT_CHARS) break;
    context += snippet;
  }
  return context.trim();
}

// ── POST /api/sara/chat ───────────────────────────────────────────────────────
/**
 * Sara AI chat endpoint with full RAG pipeline.
 *
 * Body:
 *   messages        ChatMessage[]  — conversation history
 *   language?       string         — 'en' | 'ru' (for fallback mock)
 *   contextLabel?   string         — human-readable page name
 *   currentUrl?     string         — current pathname
 *   pageDescription? string        — detailed page description from pageContext map
 *   projectId?      string         — scope RAG search to a specific project
 */
export async function POST(req: Request) {
  try {
    const {
      messages,
      language = 'en',
      contextLabel,
      currentUrl,
      pageDescription,
      projectId,
      tools,
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // ── Determine last user message (used for RAG query) ─────────────────────
    const lastUserMsg = [...messages]
      .reverse()
      .find((m: ChatMessage) => m.role === 'user');
    const userQuery: string = lastUserMsg?.content ?? '';

    // ── No API key → smart mock (dev mode) ───────────────────────────────────
    if (!process.env.OPENAI_API_KEY) {
      return devMockResponse(userQuery, contextLabel, currentUrl, language);
    }

    // ── Step 1: Embed user query ──────────────────────────────────────────────
    let ragContext = '';
    let ragSources: string[] = [];

    if (RAG_ENABLED && userQuery.length > 3) {
      try {
        const queryEmbedding = await embedQuery(userQuery);
        const chunks = await retrieveChunks(queryEmbedding, projectId);

        if (chunks.length > 0) {
          ragContext = buildRagContext(chunks);
          ragSources = [...new Set(chunks.map((c) => c.source_name))];
          console.log(
            `[Sara RAG] Retrieved ${chunks.length} chunk(s) from: ${ragSources.join(', ')}`
          );
        } else {
          console.log('[Sara RAG] No relevant chunks found (below threshold)');
        }
      } catch (ragErr) {
        // RAG failure is non-fatal — fall through to LLM-only mode
        console.error('[Sara RAG] Retrieval failed, falling back to LLM-only:', ragErr);
      }
    }

    // ── Step 2: Build system prompt ───────────────────────────────────────────
    let systemPrompt = loadSystemPrompt();

    // Inject page context (always, regardless of RAG)
    if (contextLabel || currentUrl || pageDescription) {
      systemPrompt += '\n\n--- CURRENT PAGE CONTEXT ---';
      if (contextLabel) systemPrompt += `\nSection: ${contextLabel}`;
      if (currentUrl)   systemPrompt += `\nURL: ${currentUrl}`;
      if (pageDescription) systemPrompt += `\nPage description: ${pageDescription}`;
    }

    // Inject RAG context (only when relevant chunks were found)
    if (ragContext) {
      systemPrompt +=
        '\n\n--- KNOWLEDGE BASE (use this to answer the user\'s question) ---\n' +
        ragContext +
        '\n--- END KNOWLEDGE BASE ---\n' +
        '\nIMPORTANT: Base your answer on the Knowledge Base content above when relevant. ' +
        'If the Knowledge Base does not contain the answer, use your general knowledge about Pitch Avatar.';
    }

    // ── Step 3: Call LLM ──────────────────────────────────────────────────────
    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter((m: ChatMessage) => m.role !== 'system')
        .map((m: ChatMessage) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: LLM_MODEL,
      messages: openAIMessages,
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
      ...(tools && Array.isArray(tools) && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    });

    const responseMessage = completion.choices[0]?.message;
    const responseText = responseMessage?.content || "";
    const toolCalls = responseMessage?.tool_calls;

    // Provide a fallback message if OpenAI ONLY returned a tool call (content is null)
    const finalMessage = responseText || (toolCalls ? "Working on it..." : "I couldn't generate a response.");

    return NextResponse.json({
      message: finalMessage,
      toolCalls: toolCalls || null,
      source: ragSources.length > 0 ? `RAG: ${ragSources.join(', ')}` : 'LLM Knowledge',
      ragChunksUsed: ragSources.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Sara Chat] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Dev mock (no API key) ──────────────────────────────────────────────────────
function devMockResponse(
  query: string,
  contextLabel?: string,
  currentUrl?: string,
  language?: string
) {
  const q = query.toLowerCase();
  let message = "Hello! 👋 I'm Sara, your Pitch Avatar AI Assistant. How can I help?";

  if (q.includes('tour') || q.includes('tour_ru')) {
    message =
      'I can show you how to get started right now!\n\n[Start Tour](action:start_tour:tour_create_chat_avatar_1)';
  } else if (q.includes('knowledge') || q.includes('knowledge_ru')) {
    message =
      'Your Knowledge Base is where you upload documents so your avatar can answer client questions.\n\n[Open Knowledge Base](action:navigate:/knowledge)';
  } else if (q.includes('settings') || q.includes('settings_ru')) {
    message = 'Here you go!\n\n[Go to Settings](action:navigate:/settings)';
  } else if (q.includes('chat avatar') || q.includes('chat_avatar_ru')) {
    message =
      'To create an AI Chat Avatar:\n1. **Basic Setup** — name, voice, photo\n2. **Pitch Content** — link a presentation\n3. **Instructions** — role + knowledge base\n\n[Create Chat Avatar](action:navigate:/chat-avatar/create)';
  } else if (q.includes('plan') || q.includes('billing') || q.includes('plan_ru')) {
    message =
      '**Plans:**\n- Free Trial: 7 days, 12 avatar minutes\n- Professional: 20 minutes, 500 links/mo\n- Business: 50 minutes, 5000 links/mo\n\n[View Billing](action:navigate:/settings)';
  } else if (contextLabel) {
    message = `I see you're on **${contextLabel}**. What would you like help with on this page?`;
  }

  return NextResponse.json({
    message,
    source: 'Mock (No API Key)',
    ragChunksUsed: 0,
  });
}
