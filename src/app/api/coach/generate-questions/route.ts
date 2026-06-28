import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { BuyerScenario, ROLE_TEMPLATES } from '@/types/coach';

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { projectId, maxQuestions = 5, roleTemplate = 'buyer', roleId, questionTypes } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('id, script_text, title')
      .eq('project_id', projectId);

    const roleConfig = ROLE_TEMPLATES.find(r => r.role === roleTemplate) || ROLE_TEMPLATES[0];
    const typesToGenerate = questionTypes || roleConfig.defaultQuestionTypes;

    // Simulate generating different types of questions based on the role and chosen types
    const defaultScenarios: Partial<BuyerScenario>[] = [];

    if (typesToGenerate.includes('price')) {
      defaultScenarios.push({
        questionText: 'Скільки коштує ваш продукт і які є варіанти підписок?',
        expectedAnswer: 'У нас є різні тарифи для різних потреб.',
        expectedSlideId: 'Prices',
        questionType: 'price',
        customActions: [
          { actionKey: 'offer_discount_10', label: 'Запропонувати знижку 10%', scoreModifier: 5 }
        ]
      });
    }

    if (typesToGenerate.includes('competitors')) {
      defaultScenarios.push({
        questionText: 'Чим ваше рішення краще за прямих конкурентів?',
        expectedAnswer: 'Наш продукт має унікальні можливості які надають додаткову цінність.',
        expectedSlideId: 'Competitor Advantages',
        questionType: 'competitors'
      });
    }

    if (typesToGenerate.includes('product')) {
      defaultScenarios.push({
        questionText: 'Який основний функціонал вашої платформи?',
        expectedAnswer: 'Ми пропонуємо інструменти для автоматизації процесів.',
        expectedSlideId: 'Product Details',
        questionType: 'product'
      });
    }

    if (typesToGenerate.includes('roi')) {
      defaultScenarios.push({
        questionText: 'Який очікуваний показник ROI від впровадження?',
        expectedAnswer: 'Клієнти зазвичай отримують збільшення ROI на рівні 15-20%.',
        expectedSlideId: 'ROI',
        questionType: 'roi',
        customActions: [
          { actionKey: 'show_case_study', label: 'Показати успішний кейс', scoreModifier: 12 }
        ]
      });
    }

    if (typesToGenerate.includes('technical')) {
       defaultScenarios.push({
        questionText: 'Які інструменти інтеграції ви підтримуєте?',
        expectedAnswer: 'Ми підтримуємо готові інтеграції з популярними CRM.',
        expectedSlideId: 'Integrations',
        questionType: 'technical'
      });
    }
    
    // Fill up to maxQuestions if we don't have enough
    while(defaultScenarios.length < maxQuestions) {
      defaultScenarios.push({
        questionText: 'Чи можете розказати більше про ваш підхід?',
        expectedAnswer: 'Звичайно, ось наші основні принципи.',
        questionType: 'product'
      });
    }

    const processedScenarios = (slides && slides.length > 0)
      ? slides.slice(0, maxQuestions).map((slide, idx) => {
          const defaultScen = defaultScenarios[idx % defaultScenarios.length];
          return {
            id: crypto.randomUUID(),
            projectId,
            questionText: `Питання до слайду "${slide.title || `Слайд ${idx + 1}`}": ${defaultScen.questionText}`,
            expectedAnswer: slide.script_text || defaultScen.expectedAnswer,
            expectedSlideId: slide.id,
            isGenerated: true,
            roleTemplate,
            roleId,
            questionType: defaultScen.questionType,
            customActions: defaultScen.customActions || [],
            orderIndex: idx,
            createdAt: new Date().toISOString()
          } as BuyerScenario;
        })
      : defaultScenarios.slice(0, maxQuestions).map((scen, idx) => ({
          id: crypto.randomUUID(),
          projectId,
          questionText: scen.questionText,
          expectedAnswer: scen.expectedAnswer,
          expectedSlideId: scen.expectedSlideId,
          isGenerated: true,
          roleTemplate,
          roleId,
          questionType: scen.questionType,
          customActions: scen.customActions,
          orderIndex: idx,
          createdAt: new Date().toISOString()
        } as BuyerScenario));

    return NextResponse.json({
      success: true,
      questions: processedScenarios
    });

  } catch (error: unknown) {
    console.error('Generate Questions API Error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
