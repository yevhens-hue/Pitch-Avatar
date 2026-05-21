export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle?: string;
  script: string;
  content: unknown;
}

export const roadmapSlides: SlideData[] = [
  {
    id: 1,
    tag: "CEO Update · April 2026",
    title: "First month at Pitch Avatar: Going as planned",
    subtitle: "Onboarding plan report and priorities for Month 2 and 3",
    script: "Greetings! Today I will present a report on the first month of my work at Pitch Avatar. We are strictly on schedule: the onboarding plan is 65% complete, and the experimental sandbox is 75% ready.",
    content: {
      metrics: [
        { label: "Onboarding", value: 65 },
        { label: "Sandbox", value: 75 },
        { label: "Research", value: 40 }
      ]
    }
  },
  {
    id: 2,
    tag: "Slide 2 · Market Analysis",
    title: "Analysis of market leaders and competitor onboarding",
    script: "We conducted a deep analysis of competitors such as HeyGen and Synthesia. Our unique value is interactivity. We aim to shorten the path to the Aha! moment, making it accessible right at the avatar preview stage.",
    content: {
      benchmarks: ["Aha! Moment: goal — Preview", "HeyGen: Speed-to-Value", "Success Checklists"]
    }
  },
  {
    id: 3,
    tag: "Slide 3 · Baseline Data",
    title: "PostHog data for the last 30 days",
    script: "The figures show that we have work to do. Conversion to paid is currently 1.38% — this is the red zone. The main drop-off occurs at the second step of the avatar creation funnel, where we lose up to 35% of users.",
    content: {
      metrics: [
        { label: "Trial → Paid", value: "1.38%", status: "red" },
        { label: "Retention W1", value: "2.2%", status: "red" },
        { label: "Avatar Drop", value: "59%", status: "amber" }
      ]
    }
  },
  {
    id: 4,
    tag: "Slide 4 · Work Done",
    title: "Strategic artifacts: the foundation of the PM process",
    script: "We built the foundation: visualized the CJM, decomposed the backlog via User Story Map, and created a metric tree. Now every change in the product is backed by data and tied to LTV.",
    content: {
      artifacts: ["Customer Journey Map", "User Story Map", "Metric Map"]
    }
  },
  {
    id: 5,
    tag: "Slide 5 · Solution: Activation & Conversion",
    title: "Increasing Activation: Onboarding 2.0",
    script: "Our solution is the implementation of JTBD scenarios and Sara AI Assistant. We are already working on 5 scenarios that will guide the user to their first interactive presentation.",
    content: {
      targets: ["-15-20% drop-off on Step 2", "Sara AI integration", "JTBD Scenarios"]
    }
  },
  {
    id: 6,
    tag: "Slide 6 · Sandbox",
    title: "Sandbox and rapid prototyping",
    script: "For speed, we use Sandbox on Vercel. This allows us to test hypotheses and new funnels in hours instead of weeks, without risking the stability of the core product.",
    content: {
      features: ["Full UI copy", "Sara AI Prototype", "PostHog tracking"]
    }
  },
  {
    id: 7,
    tag: "Slide 7 · Sara in Action",
    title: "Sara: contextual help at a critical moment",
    script: "Sara is our secret retention agent. She activates exactly at the moment of drop-off on the second step and helps the user with voice, reducing cognitive load.",
    content: {
      features: ["Voice TTS", "Context Aware", "Drag & Move"]
    }
  },
  {
    id: 8,
    tag: "Slide 8 · Analytics and Tracking",
    title: "PostHog: event analytics configured",
    script: "Now we see everything. Every question to the avatar and every click on Sara's suggestions is recorded in PostHog. This is the foundation for A/B tests that we will start in the near future.",
    content: {
      events: ["chat_avatar_rendered", "sara_chip_clicked", "wizard_step_completed"]
    }
  },
  {
    id: 9,
    tag: "Slide 9 · Research",
    title: "Behavioral analysis and JTBD Interviews",
    script: "In the second month, the focus will shift to qualitative research. I will conduct 7 deep JTBD interviews to understand why users do not return after the first session.",
    content: {
      research: ["7 JTBD Interviews", "Hotjar Heatmaps", "Cohort Analysis"]
    }
  },
  {
    id: 10,
    tag: "Slide 10 · Retention & Growth Loops Strategy",
    title: "Growth Loops: from tool to growth system",
    script: "We are building a growth system. Social loops within teams and the viral effect of a branded player will allow us to grow organically with minimal marketing costs.",
    content: {
      loops: ["Social Loops", "Virality", "Retention Focus"]
    }
  },
  {
    id: 11,
    tag: "Slide 11 · Roadmap",
    title: "Business Roadmap: Month 2 and 3",
    script: "Here is our plan for May and June. In May we focus on activation and templates, and in June — on Sara A/B testing and retention in the HR Learning segment.",
    content: {
      milestones: ["Interactive Tours", "7 Templates", "Sara A/B Test"]
    }
  },
  {
    id: 12,
    tag: "Slide 12 · Summary and Plan",
    title: "Brief summary and main KPI",
    script: "Summarizing: the foundation is laid, analytics are configured, prototypes are in progress. Our main KPI is improving activation metrics. Thank you! I am ready to answer your questions.",
    content: {
      kpi: "Improve activation metrics by end of probation"
    }
  }
];
