import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ── Clients (lazy init to keep module import safe in tests) ──────────────────
let _openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
};

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// ── Types ────────────────────────────────────────────────────────────────────
interface IngestPayload {
  /** Plain text to ingest */
  content: string;
  /** Human-readable name for the source */
  sourceName: string;
  /** 'manual' | 'pdf' | 'url' | 'page_context' */
  sourceType?: string;
  /** Original URL (optional) */
  sourceUrl?: string;
  /** If provided, chunk is scoped to a project; otherwise global */
  projectId?: string;
}

// ── Chunking ─────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 800;    // characters
const CHUNK_OVERLAP = 100; // characters

function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    chunks.push(cleaned.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
    if (start >= cleaned.length) break;
  }
  return chunks.filter((c) => c.length > 50); // drop tiny tail chunks
}

// ── Embedding ─────────────────────────────────────────────────────────────────
async function embedChunks(chunks: string[]): Promise<number[][]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
    encoding_format: 'float',
  });
  return res.data.map((d) => d.embedding);
}

// ── POST /api/sara/ingest ────────────────────────────────────────────────────
/**
 * Ingests a text document into Sara's RAG knowledge base.
 *
 * Body (JSON):
 *   content     string   — full text to ingest
 *   sourceName  string   — e.g. "Pitch Avatar Pricing Guide"
 *   sourceType? string   — 'manual'|'pdf'|'url'|'page_context'  (default: 'manual')
 *   sourceUrl?  string   — original URL if applicable
 *   projectId?  string   — scope to a project (optional, omit for global)
 *
 * Auth: requires SUPABASE_SERVICE_ROLE_KEY → internal / server-to-server only.
 * Do NOT expose this endpoint publicly without API key validation.
 */
export async function POST(req: Request) {
  // ── Simple API key guard (internal use) ────────────────────────────────────
  const authHeader = req.headers.get('authorization');
  const expectedKey = process.env.SARA_INGEST_API_KEY;
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Validate env ───────────────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  try {
    const body: IngestPayload = await req.json();
    const { content, sourceName, sourceType = 'manual', sourceUrl, projectId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: '"content" is required' }, { status: 400 });
    }
    if (!sourceName?.trim()) {
      return NextResponse.json({ error: '"sourceName" is required' }, { status: 400 });
    }

    // 1. Chunk the text
    const chunks = chunkText(content);
    console.log(`[Sara Ingest] "${sourceName}" → ${chunks.length} chunk(s)`);

    // 2. Generate embeddings (batch call)
    const embeddings = await embedChunks(chunks);

    // 3. Upsert into Supabase
    const supabase = getSupabaseAdmin();

    // Delete existing chunks for the same source + project (full re-ingest)
    await supabase
      .from('sara_knowledge_chunks')
      .delete()
      .eq('source_name', sourceName)
      .is('project_id', projectId ?? null);

    const rows = chunks.map((chunk, i) => ({
      source_type: sourceType,
      source_name: sourceName,
      source_url: sourceUrl ?? null,
      content: chunk,
      embedding: JSON.stringify(embeddings[i]), // Supabase expects stringified vector
      project_id: projectId ?? null,
    }));

    const { error } = await supabase.from('sara_knowledge_chunks').insert(rows);

    if (error) {
      console.error('[Sara Ingest] Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sourceName,
      chunksIngested: chunks.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Sara Ingest] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
