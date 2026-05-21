import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { BuyerScenario } from '@/types/coach';

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authError = await requireAuth(req);
    if (authError) return authError;

    // 2. Parse payload
    const { projectId, maxQuestions = 5 } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // 3. Try to fetch project slides/scripts to ground the questions in context
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('id, script_text, title')
      .eq('project_id', projectId);

    // 4. Fallback default scenarios based on common buyer personas
    const defaultScenarios: Omit<BuyerScenario, 'id' | 'projectId' | 'createdAt'>[] = [
      {
        questionText: 'Скільки коштує ваш продукт і які є варіанти підписок?',
        expectedAnswer: 'У нас є дуже конкурентні ціни. Ми пропонуємо місячні та річні тарифи Professional та Business, а також кастомні умови Enterprise.',
        expectedSlideId: 'Prices',
        isGenerated: true,
        customActions: [
          { actionKey: 'offer_discount_10', label: 'Запропонувати знижку 10%', scoreModifier: 5 },
          { actionKey: 'offer_trial', label: 'Запропонувати безкоштовний тріал', scoreModifier: 10 }
        ]
      },
      {
        questionText: 'Чим ваше рішення краще за прямих конкурентів?',
        expectedAnswer: 'Наш продукт має унікальні можливості інтерактивних аватарок з ліпсінком в реальному часі та просунутий RAG для 100% точності.',
        expectedSlideId: 'Competitor Advantages',
        isGenerated: true,
        customActions: [
          { actionKey: 'schedule_demo', label: 'Запросити на демо-дзвінок', scoreModifier: 8 }
        ]
      },
      {
        questionText: 'Скільки мов підтримує ваш аватар?',
        expectedAnswer: 'Наш аватар підтримує більше 30 мов для локалізації та глобального охоплення вашої аудиторії.',
        expectedSlideId: 'Languages',
        isGenerated: true
      },
      {
        questionText: 'Який очікуваний показник ROI від впровадження вашого рішення?',
        expectedAnswer: 'Клієнти зазвичай отримують збільшення ROI на рівні 15-20% за рахунок автоматизації навчання та збільшення конверсії в продажі.',
        expectedSlideId: 'ROI',
        isGenerated: true,
        customActions: [
          { actionKey: 'show_case_study', label: 'Показати успішний кейс', scoreModifier: 12 }
        ]
      },
      {
        questionText: 'Які інструменти інтеграції ви підтримуєте для CRM платформ?',
        expectedAnswer: 'Ми підтримуємо готові інтеграції з HubSpot, Salesforce та надаємо повноцінне REST API для розробників.',
        expectedSlideId: 'Integrations',
        isGenerated: true
      }
    ];

    // If custom slides with scripts exist, we could mock custom-generated questions based on slides content
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
            customActions: defaultScen.customActions || [],
            createdAt: new Date().toISOString()
          };
        })
      : defaultScenarios.slice(0, maxQuestions).map((scen, idx) => ({
          id: crypto.randomUUID(),
          projectId,
          questionText: scen.questionText,
          expectedAnswer: scen.expectedAnswer,
          expectedSlideId: scen.expectedSlideId,
          isGenerated: true,
          customActions: scen.customActions,
          createdAt: new Date().toISOString()
        }));

    // In a real application, we would insert these into the buyer_scenarios table in Supabase
    // To make this MVP highly interactive, we return them directly
    return NextResponse.json({
      success: true,
      questions: processedScenarios
    });

  } catch (error: unknown) {
    console.error('Generate Questions API Error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
