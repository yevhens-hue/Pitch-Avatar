import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { message } = await req.json();
    console.log('AI Processing message:', message);

    // GSD: In a real app, you would use 'message' and 'context' for RAG search
    
    // For now, let's simulate a thoughtful AI response
    const responses = [
      "Based on the presentation, this product aims to automate sales follow-ups using AI avatars.",
      "The key advantage mentioned on slide 2 is the 24/7 availability of your sales team.",
      "I see you're asking about pricing. While the deck covers features, our typical enterprise plans start with a discovery call.",
      "According to the knowledge base, we support over 40 languages for avatar voice cloning."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ text: randomResponse });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
