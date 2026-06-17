import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';


export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { 
      projectId, 
      slideId, 
      userMessage, 
      contextMode,
      listenerName,
      language
    } = await req.json();

    if (!projectId || !userMessage) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const greeting = language === 'Ukrainian' ? 'Привіт' : language === 'Romanian' ? 'Salut' : 'Hello';
    const namePrefix = listenerName ? `${greeting}, ${listenerName}! ` : '';
    
    let avatarResponse = '';
    let reactionType = 'text';
    let reactionData = '';

    // Simulate looking up knowledge base and reacting
    if (userMessage.toLowerCase().includes('option a') || userMessage.toLowerCase().includes('option 1')) {
      avatarResponse = `**Правильно!** Вы выбрали верный вариант.`;
    } else if (userMessage.toLowerCase().includes('option')) {
      avatarResponse = `**Неверно!** Попробуйте еще раз.`;
    } else if (userMessage.toLowerCase().includes('video') || userMessage.toLowerCase().includes('відео')) {
      avatarResponse = `${namePrefix}Конечно, посмотрите это короткое видео.`;
      reactionType = 'video';
      reactionData = 'https://example.com/demo.mp4';
    } else if (userMessage.toLowerCase().includes('slide') || userMessage.toLowerCase().includes('слайд')) {
      avatarResponse = `${namePrefix}Давайте переключимся на другой слайд для деталей.`;
      reactionType = 'slide';
      reactionData = '3';
    } else {
      avatarResponse = `${namePrefix}Хороший вопрос: "${userMessage}". Я думаю, что это решает вашу проблему.`;
    }

    // Simulate saving analytics
    // In a real app, we would calculate semantic score and save it to the DB for the dashboard.

    return NextResponse.json({
      success: true,
      avatarResponse,
      reactionType,
      reactionData
    });

  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
