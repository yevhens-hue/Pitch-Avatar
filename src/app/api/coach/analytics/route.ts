import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, score, feedback, isCorrect } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    // MOCK: In a real implementation, this would save the evaluation results
    // into a database table like "coach_evaluations" associated with the user/project.
    
    console.log(`[Analytics] Saved evaluation for project ${projectId}:`);
    console.log(`[Analytics] Score: ${score}, Correct: ${isCorrect}`);
    console.log(`[Analytics] Feedback: ${feedback}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics saved successfully',
      data: { projectId, score, isCorrect }
    });
  } catch (error: any) {
    console.error('Coach Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
