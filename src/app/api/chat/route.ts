import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { message, settings } = await req.json();
    const mode = settings?.answerMode || 'Hybrid';
    const external = settings?.externalRAG;

    let responseText = "";
    let source = "LLM Knowledge";

    if (mode === 'LLM Only') {
      responseText = "Based on my general knowledge, I can tell you that Pitch Avatar is a platform for interactive AI presentations.";
    } else {
      // Simulate External RAG call if enabled
      if (external?.enabled && external?.endpoint) {
        // GSD: Map request fields according to config
        const mappedRequest = {
          [external.requestMapping.query]: message,
          [external.requestMapping.avatarId]: 'avatar_123',
          [external.requestMapping.sessionId]: 'session_456'
        };
        console.log('Sending to External RAG:', mappedRequest);

        // Simulate external response with confidence
        const mockConfidence = 0.65; // Below default 0.7 threshold for testing
        
        if (mockConfidence >= (external.confidenceThreshold || 0.7)) {
          responseText = `[External RAG] According to ${external.name}, the answer is found in your specialized database.`;
          source = external.name;
        } else {
          // Fallback logic
          if (external.fallback?.useInternalOnFail) {
            responseText = "[Internal RAG] External RAG confidence too low. Found this in your uploaded PDF: Pitch Avatar supports real-time lip-sync.";
            source = "Internal Documents";
          } else if (mode === 'Hybrid' || external.fallback?.useLLMOnLowConfidence) {
            responseText = "[LLM Fallback] External RAG confidence too low. Here is a general AI response.";
            source = "LLM Fallback";
          } else {
            responseText = "I'm sorry, I couldn't find a high-confidence answer in your specialized knowledge base and Grounded mode is strictly enforced.";
            source = "None (Low Confidence)";
          }
        }
      } else {
        // Standard Internal RAG logic
        responseText = "I found in your documents that Pitch Avatar uses advanced RAG to ensure accuracy.";
        source = "Internal Documents";
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json({ 
      message: responseText,
      source: source,
      mode: mode
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
