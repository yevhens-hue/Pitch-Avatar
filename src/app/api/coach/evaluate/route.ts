import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { CoachEvaluation, EvaluationResult } from '@/types/coach';

function calculateSemanticScore(userStr: string, expectedStr: string): number {
  if (!userStr || !expectedStr) return 0;
  
  const userWords = new Set(userStr.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').split(/\s+/));
  const expectedWords = new Set(expectedStr.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').split(/\s+/));
  
  let intersectionSize = 0;
  for (const word of userWords) {
    if (expectedWords.has(word)) {
      intersectionSize++;
    }
  }
  
  if (userWords.size === 0 || expectedWords.size === 0) return 0;
  
  const ratio = intersectionSize / Math.sqrt(userWords.size * expectedWords.size);
  return Math.min(100, Math.round(ratio * 120)); 
}

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { 
      projectId, 
      questionText, 
      userAnswer, 
      slideShown, 
      expectedAnswer, 
      expectedSlideId,
      customActionTriggered 
    } = await req.json();

    if (!projectId || !questionText || !userAnswer) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const slideMatched = expectedSlideId ? (slideShown === expectedSlideId) : true;
    let semanticScore = calculateSemanticScore(userAnswer, expectedAnswer || '');
    
    let actionBonus = customActionTriggered ? 15 : 0;
    let finalScore = Math.min(100, (slideMatched ? 40 : 10) + Math.round(semanticScore * 0.6) + actionBonus);

    if (userAnswer.trim().split(/\s+/).length < 2) {
      finalScore = 0;
      semanticScore = 0;
    }

    let result: EvaluationResult = 'Incorrect';
    if (finalScore >= 70) result = 'Correct';
    else if (finalScore >= 40) result = 'Partially Correct';

    let feedback = '';
    const recommendations: string[] = [];
    
    if (result === 'Correct') {
      if (slideMatched) {
        feedback = 'Чудова відповідь! Ви успішно показали релевантний слайд і переконливо розкрили суть запитання.';
      } else {
        feedback = 'Гарна відповідь словами, але ви забули перемкнути презентацію на правильний слайд.';
        recommendations.push('Завжди підкріплюйте свої слова візуальним контентом (слайдами).');
      }
    } else {
      if (userAnswer.trim().length === 0) {
        feedback = 'Відповідь відсутня або надто коротка. Будь ласка, спробуйте відповісти голосом чи текстом.';
        recommendations.push('Не мовчіть. Поясніть цінність продукту своїми словами.');
      } else if (!slideMatched) {
        feedback = 'Неправильний слайд та слабка аргументація. Спробуйте показати потрібний слайд та чіткіше відповісти за темою.';
        recommendations.push(`Рекомендуємо вивчити слайд: ${expectedSlideId || 'відповідний слайд'}`);
        recommendations.push('Уважніше вислухайте питання клієнта.');
      } else {
        feedback = 'Слайд обрано вірно, але ваші слова не розкривають тему повністю. Спробуйте використати ключові аргументи з підказки.';
        recommendations.push('Більш детально описуйте переваги, зображені на слайді.');
      }
    }

    const evaluation: CoachEvaluation = {
      result,
      score: finalScore,
      feedback,
      recommendations,
      productKnowledge: semanticScore,
      objectionHandling: finalScore,
      needsIdentification: Math.min(100, finalScore + 10),
      valuePresentation: Math.min(100, semanticScore + 20),
      slideUsage: slideMatched ? 100 : 0
    };

    return NextResponse.json({
      success: true,
      isCorrect: result === 'Correct',
      score: finalScore,
      slideMatched,
      semanticScore,
      feedback,
      evaluation,
      diagnostics: { wordsChecked: userAnswer.trim().split(/\s+/).length, actionBonus }
    });

  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
