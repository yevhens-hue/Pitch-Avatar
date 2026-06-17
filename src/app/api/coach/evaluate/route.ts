import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';

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
    let isCorrect = false;
    let testOptions: string[] | undefined = undefined;

    // Fetch the scenario associated with the current project and slide (or any matching question)
    // For simplicity, we just fetch one that matches. In a real app we might do semantic search.
    const { data: scenario, error } = await supabase
      .from('buyer_scenarios')
      .select('*')
      .eq('project_id', projectId)
      .eq('expected_slide_id', slideId)
      .single();

    if (scenario && scenario.metadata) {
      const meta = scenario.metadata;
      
      if (meta.isTest && meta.testOptions) {
        testOptions = meta.testOptions;
        // Check if user selected correct option
        const correctOpt = meta.testOptions[meta.correctOptionIndex];
        if (userMessage === correctOpt || userMessage === meta.correctOptionIndex?.toString()) {
          isCorrect = true;
          avatarResponse = `${namePrefix}**Правильно!** Вы выбрали верный вариант.`;
        } else {
          avatarResponse = `${namePrefix}**Неверно!** Попробуйте еще раз.`;
        }
      } else {
        // Standard text comparison
        isCorrect = userMessage.toLowerCase().includes(scenario.expected_answer?.toLowerCase() || '');
        avatarResponse = isCorrect ? `${namePrefix}Отличный ответ.` : `${namePrefix}Не совсем так.`;
      }

      reactionType = meta.reactionType || 'text';
      reactionData = meta.reactionData || '';
    } else {
      // Fallback
      avatarResponse = `${namePrefix}Хороший вопрос: "${userMessage}". Я думаю, что это решает вашу проблему.`;
    }

    return NextResponse.json({
      success: true,
      avatarResponse,
      reactionType,
      reactionData,
      isCorrect,
      testOptions
    });

  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
