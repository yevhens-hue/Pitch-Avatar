export type AnswerMode = 'Grounded' | 'Hybrid' | 'LLM Only';

export type AuthType = 'API key' | 'Bearer token' | 'OAuth' | 'No auth';

export interface ExternalRAGConfig {
  enabled: boolean;
  name: string;
  endpoint: string;
  authType: AuthType;
  apiKey?: string;
  timeout: number; // 3-10 seconds
  confidenceThreshold: number; // 0.0 - 1.0
  requestMapping: {
    query: string;
    userLanguage: string;
    conversationHistory: string;
    avatarId: string;
    sessionId: string;
  };
  responseMapping: {
    answer: string;
    chunks: string;
    sources: string;
    confidence: string;
    metadata: string;
  };
  fallback: {
    useInternalOnFail: boolean;
    useLLMOnLowConfidence: boolean;
  };
}

export interface KnowledgeBaseSettings {
  answerMode: AnswerMode;
  externalRAG: ExternalRAGConfig;
}

export const DEFAULT_SETTINGS: KnowledgeBaseSettings = {
  answerMode: 'Hybrid',
  externalRAG: {
    enabled: false,
    name: '',
    endpoint: '',
    authType: 'No auth',
    timeout: 5,
    confidenceThreshold: 0.7,
    requestMapping: {
      query: 'query',
      userLanguage: 'user_language',
      conversationHistory: 'conversation_history',
      avatarId: 'avatar_id',
      sessionId: 'customer_id',
    },
    responseMapping: {
      answer: 'answer',
      chunks: 'chunks',
      sources: 'sources',
      confidence: 'confidence_score',
      metadata: 'metadata',
    },
    fallback: {
      useInternalOnFail: true,
      useLLMOnLowConfidence: true,
    },
  },
};
