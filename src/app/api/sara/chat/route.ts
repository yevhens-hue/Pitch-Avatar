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
      { role: 'system' as const, content: systemPromptContent },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
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
      let action: string | undefined;
      let actionPayload: any;
      
      if (lastUserMessage.includes("тур") || lastUserMessage.includes("tour")) {
        responseText = "Starting the onboarding tour right now!";
        action = "start_tour";
        actionPayload = "tour_create_chat_avatar_1";
      } else if (lastUserMessage.includes("chat-avatar") || lastUserMessage.includes("chat avatar")) {
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
        action,
        actionPayload
      });
    }

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "start_tour",
          description: "Starts a Stonly interactive onboarding tour or guide on the user's screen. Use this when the user asks for a tour, a guide, or how to do a specific action step-by-step.",
          parameters: {
            type: "object",
            properties: {
              tourId: {
                type: "string",
                description: "The ID of the tour to start.",
                enum: ['tour_create_chat_avatar_1', 'tour_generate_slides', 'tour_upload_video', 'tour_create_avatar', 'tour_generate_video']
              }
            },
            required: ["tourId"]
          }
        }
      }
    ];

    // If API key is present, call actual OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 500,
      tools: tools,
    });

    const responseMessage = completion.choices[0]?.message;
    
    // Check if a tool was called
    if (responseMessage?.tool_calls) {
      const toolCall = responseMessage.tool_calls[0] as { function: { name: string; arguments: string } };
      if (toolCall.function.name === 'start_tour') {
        const args = JSON.parse(toolCall.function.arguments);
        return NextResponse.json({
          message: "Starting the tour for you!",
          source: "OpenAI LLM",
          action: "start_tour",
          actionPayload: args.tourId
        });
      }
    }

    const responseText = responseMessage?.content || "I couldn't process that response.";

    return NextResponse.json({ 
      message: responseText,
      source: "OpenAI LLM",
    });

  } catch (error: any) {
    console.error('Sara Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process message' }, { status: 500 });
  }
}
