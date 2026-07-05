// ─── Core Enums & Templates ───────────────────────────────────────────────────

export type ShowAnswerFormat = 'text' | 'voice' | 'none';
export type EvaluationMode = 'auto' | 'llm' | 'manual' | 'strict' | 'forgiving';
export type EvaluationResult = 'Correct' | 'Partially Correct' | 'Incorrect';
export type RoleTemplate = 'buyer' | 'customer' | 'recruiter' | 'investor' | 'student' | 'manager';
export type QuestionType = 'product' | 'price' | 'competitors' | 'roi' | 'objection' | 'use_case' | 'technical' | 'discovery';
export type DialogMode = 'questioning' | 'answering';
export type BuyerPersona = 'skeptic' | 'budget_controller' | 'technical' | 'friendly' | 'negotiator' | 'none';
export type StartMode = 'avatar_asks_first' | 'seller_asks_first';
export type CoachTestType = 'sales' | 'support' | 'custom';
export type QuestionSource = 'manual' | 'ai_generated' | 'imported' | 'document';

// ─── Coach Settings ────────────────────────────────────────────────────────────

export interface CoachSettings {
  id?: string;
  projectId: string;
  /** Format of "Show Answer" reveal */
  showAnswerFormat?: ShowAnswerFormat;
  /** Auto-evaluate after each answer */
  evaluateImmediately?: boolean;
  /** Allow seller to skip a question */
  allowSkip?: boolean;
  /** Maximum questions per session */
  maxQuestions: number;
  /** Check Answer feature enabled */
  checkAnswer?: boolean;
  /** Question delivery order */
  questionDelivery?: 'random' | 'sequential';
  /** Optional starting slide ID for the coach mode session */
  startFromSlideId?: string;
  /** Evaluation engine: word-overlap (auto), LLM, or presenter-manual */
  evaluationMode: EvaluationMode;
  /** Enable custom scenarios */
  enableCustomScenarios?: boolean;
  /** Track and save session analytics */
  analyticsMode?: boolean;
  /** Buyer persona role (Legacy) */
  roleTemplate?: RoleTemplate;
  /** Trainee role id (Primary) linking to library */
  traineeRoleId?: string;
  /** System prompt / instructions for avatar-buyer */
  systemPrompt?: string;
  /** Specific flavor/tone of the buyer */
  buyerPersona?: BuyerPersona;
  /** Type of coach test */
  testType?: CoachTestType;
  /** Who starts the dialog */
  startMode?: StartMode;
  /** Test format shown to the trainee (ТЗ Mockup 4/5) */
  testFormat?: 'text_voice' | 'text_slide' | 'slide_only';
  /** When questions are asked relative to slides */
  questionTiming?: 'before' | 'on_slides' | 'after' | 'no_slides';
  /** Question order within a training session */
  questionOrder?: 'sequential' | 'random_n';
  /** Three independent visibility flags shown to the trainee */
  feedbackFlags?: {
    immediateFeedback: boolean;
    showCorrectAnswers: boolean;
    alwaysShowScore: boolean;
  };
  /** Minimum passing score (percent) */
  passingScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Scenarios ─────────────────────────────────────────────────────────────────

export interface CustomAction {
  actionKey: string;
  label: string;
  expectedResult?: string;
  scoreModifier?: number;
}

export interface BuyerScenario {
  id: string;
  projectId?: string;
  questionText: string;
  expectedAnswer: string;
  expectedSlideId?: string;
  isGenerated?: boolean; // Legacy
  source?: QuestionSource;
  roleTemplate?: RoleTemplate; // Legacy
  traineeRoleId?: string;
  roleId?: string; // Reference to the existing ICP / Use Case Role ID
  questionType?: QuestionType;
  customActions?: CustomAction[];
  orderIndex?: number; // Used when questionDelivery is 'sequential'
  evaluationCriteria?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Evaluation ────────────────────────────────────────────────────────────────

export interface CoachEvaluation {
  result: EvaluationResult;
  score: number;
  feedback: string;
  recommendations: string[];
  /** Sub-scores (0-100 each) */
  productKnowledge: number;
  objectionHandling: number;
  needsIdentification: number;
  valuePresentation: number;
  slideUsage: number;
}

export interface SessionLogEntry {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  slideShown?: string;
  score?: number;
  feedback?: string;
  evaluation?: CoachEvaluation;
  timestamp?: string;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface TrainingSession {
  id: string;
  projectId: string;
  listenerId?: string;
  score: number;
  isTrainMode: boolean;
  sessionLogs: SessionLogEntry[];
  durationSeconds?: number;
  evaluation?: CoachEvaluation;
  createdAt: string;
  updatedAt?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TrainingAnalytics {
  projectId: string;
  totalSessions: number;
  totalSessionsCompleted?: number;
  totalQuestionsAnswered?: number;
  avgScore: number;
  averageScore?: number;
  avgDurationSeconds: number;
  successRate: number; // % sessions with score >= 70
  sessions: TrainingSession[];
  skillsBreakdown?: Record<string, number>;
  commonWeaknesses?: string[];
}

// ─── Train Mode ───────────────────────────────────────────────────────────────

export interface SaveToRagPayload {
  projectId: string;
  questionText: string;
  expectedAnswer: string;
  expectedSlideId?: string;
  saveTarget: 'rag' | 'scenario' | 'both';
}

export interface SaveInstructionsPayload {
  projectId: string;
  systemPrompt: string;
}

export interface GenerateQuestionsPayload {
  projectId: string;
  maxQuestions?: number;
  roleTemplate?: RoleTemplate;
  questionTypes?: QuestionType[];
}

// ─── Role Template Metadata ───────────────────────────────────────────────────

export interface RoleTemplateConfig {
  role: RoleTemplate;
  label: string;
  description: string;
  defaultPrompt: string;
  defaultQuestionTypes: QuestionType[];
}

export const ROLE_TEMPLATES: RoleTemplateConfig[] = [
  {
    role: 'buyer',
    label: 'Buyer',
    description: 'Corporate buyer evaluating solutions for business needs',
    defaultPrompt: 'You are a professional B2B buyer. Ask challenging questions about product value, pricing, and ROI.',
    defaultQuestionTypes: ['product', 'price', 'roi', 'objection'],
  },
  {
    role: 'customer',
    label: 'Customer',
    description: 'Existing customer exploring additional features',
    defaultPrompt: 'You are an existing customer curious about new features and use cases.',
    defaultQuestionTypes: ['product', 'use_case', 'technical'],
  },
  {
    role: 'recruiter',
    label: 'Recruiter',
    description: 'HR recruiter evaluating the platform for onboarding',
    defaultPrompt: 'You are an HR recruiter evaluating this platform for employee onboarding and training.',
    defaultQuestionTypes: ['product', 'use_case', 'price'],
  },
  {
    role: 'investor',
    label: 'Investor',
    description: 'Investor evaluating business potential and market fit',
    defaultPrompt: 'You are a potential investor. Ask about market size, competitive advantages, and growth metrics.',
    defaultQuestionTypes: ['competitors', 'roi', 'product'],
  },
  {
    role: 'student',
    label: 'Student',
    description: 'Student or trainee learning about the product',
    defaultPrompt: 'You are a student who is new to this topic. Ask basic and clarifying questions.',
    defaultQuestionTypes: ['product', 'use_case'],
  },
  {
    role: 'manager',
    label: 'Manager',
    description: 'Department manager assessing team adoption',
    defaultPrompt: 'You are a mid-level manager assessing whether this solution fits your team\'s workflow.',
    defaultQuestionTypes: ['product', 'price', 'technical', 'use_case'],
  },
];
