export type ShowAnswerFormat = 'text' | 'voice' | 'none';

export interface CoachSettings {
  id: string;
  projectId: string;
  showAnswerFormat: ShowAnswerFormat;
  evaluateImmediately: boolean;
  allowSkip: boolean;
  maxQuestions: number;
  createdAt: string;
}

export interface CustomAction {
  actionKey: string;
  label: string;
  expectedResult?: string;
  scoreModifier?: number;
}

export interface BuyerScenario {
  id: string;
  projectId: string;
  questionText: string;
  expectedAnswer: string;
  expectedSlideId?: string;
  isGenerated?: boolean;
  customActions?: CustomAction[];
  createdAt: string;
}

export interface SessionLogEntry {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  slideShown?: string;
  score?: number;
  feedback?: string;
}

export interface TrainingSession {
  id: string;
  projectId: string;
  listenerId?: string;
  score: number;
  isTrainMode: boolean;
  sessionLogs: SessionLogEntry[];
  createdAt: string;
}
