export type AnswerMode = 'Grounded' | 'Hybrid' | 'LLM Only';

export type AuthType = 'API key' | 'Bearer token' | 'OAuth' | 'No auth';

export interface ExternalRAGConfig {
  enabled: boolean;
  name: string;
  endpoint: string;
  authType: AuthType;
  apiKey?: string;
  timeout: number; // 3-10 seconds
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
    fallback: {
      useInternalOnFail: true,
      useLLMOnLowConfidence: true,
    },
  },
};
