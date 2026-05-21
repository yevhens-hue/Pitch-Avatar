import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
// Note: Requires OPENAI_API_KEY environment variable to be set
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_if_not_provided',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Read the System Prompt from docs/sara/system_prompt.md
    let systemPromptContent = "You are Sara, the official Pitch Avatar AI assistant.";
    try {
      const promptPath = path.join(process.cwd(), 'docs', 'sara', 'system_prompt.md');
      systemPromptContent = fs.readFileSync(promptPath, 'utf8');
    } catch (fsError) {
      console.warn("Could not read system_prompt.md, falling back to default.", fsError);
    }

    // Add system message at the beginning
    const openAIMessages = [
      { role: 'system', content: systemPromptContent },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }))
    ];

    // Check if we have a real API key. If not, fallback to a smart mock response
    // to avoid failing if the user hasn't set up OpenAI yet.
    if (!process.env.OPENAI_API_KEY) {
      console.log("[Sara AI] OPENAI_API_KEY not set. Using smart mock based on system prompt.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
      let responseText = "I'm still learning! But I can help you navigate Pitch Avatar.";
      
      if (lastUserMessage.includes("chat-avatar") || lastUserMessage.includes("chat avatar")) {
        responseText = `To create an AI Chat-avatar, follow these steps:
1. **Create avatar**: Set name, voice, language, and photo.
2. **Pitch content**: Upload a new presentation or select an existing one.
3. **Avatar instructions**: Select a role (Demo, Sales, HR, etc.), write a Greeting and Instructions, and upload your Knowledge base. Click Save!`;
      } else if (lastUserMessage.includes("hello") || lastUserMessage.includes("hi")) {
        responseText = "Hello! 👋 I'm Sara, your Pitch Avatar AI Assistant. How can I help you today?";
      }

      return NextResponse.json({ 
        message: responseText,
        source: "Mock LLM (Missing API Key)",
      });
    }

    // If API key is present, call actual OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "I couldn't process that response.";

    return NextResponse.json({ 
      message: responseText,
      source: "OpenAI LLM",
    });

  } catch (error: any) {
    console.error('Sara Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process message' }, { status: 500 });
  }
}
