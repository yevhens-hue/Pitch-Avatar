import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

// Simple helper to calculate word overlap/similarity for the MVP
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
  
  // Cosine-like word overlap ratio
  const ratio = intersectionSize / Math.sqrt(userWords.size * expectedWords.size);
  return Math.min(100, Math.round(ratio * 120)); // scale slightly to reward correct phrases
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authError = await requireAuth(req);
    if (authError) return authError;

    // 2. Parse payload
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

    // 3. Validation matching
    const slideMatched = expectedSlideId ? (slideShown === expectedSlideId) : true;
    
    // Compute semantic match score (0-100)
    let semanticScore = calculateSemanticScore(userAnswer, expectedAnswer || '');
    
    // Add bonus points if custom action (e.g. discount, case study) was correctly selected
    let actionBonus = 0;
    if (customActionTriggered) {
      actionBonus = 15; // +15 points for proactive action
    }

    let finalScore = Math.min(100, (slideMatched ? 40 : 10) + Math.round(semanticScore * 0.6) + actionBonus);

    // If answer is empty or extremely short, set to 0
    if (userAnswer.trim().split(/\s+/).length < 2) {
      finalScore = 0;
      semanticScore = 0;
    }

    const isCorrect = finalScore >= 70;

    // 4. Generate dynamic, highly personalized feedback
    let feedback = '';
    if (isCorrect) {
      if (slideMatched) {
        feedback = 'Чудова відповідь! Ви успішно показали релевантний слайд і переконливо розкрили суть запитання.';
      } else {
        feedback = 'Гарна відповідь словами, але ви забули перемкнути презентацію на правильний слайд для візуального підтвердження.';
      }
    } else {
      if (userAnswer.trim().length === 0) {
        feedback = 'Відповідь відсутня або надто коротка. Будь ласка, спробуйте відповісти голосом чи текстом.';
      } else if (!slideMatched) {
        feedback = 'Неправильний слайд та слабка аргументація. Спробуйте показати потрібний слайд та чіткіше відповісти за темою.';
      } else {
        feedback = 'Слайд обрано вірно, але ваші слова не розкривають тему повністю. Спробуйте використати ключові аргументи з підказки.';
      }
    }

    // Return detailed grading metrics
    return NextResponse.json({
      success: true,
      isCorrect,
      score: finalScore,
      slideMatched,
      semanticScore,
      feedback,
      diagnostics: {
        wordsChecked: userAnswer.trim().split(/\s+/).length,
        actionBonus
      }
    });

  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
