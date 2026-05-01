import { useKnowledgeStore } from '@/lib/knowledgeStore';
import { DEFAULT_SETTINGS } from '@/lib/knowledge';

describe('useKnowledgeStore', () => {
  beforeEach(() => {
    useKnowledgeStore.getState().updateSettings(DEFAULT_SETTINGS);
  });

  it('initializes with default settings', () => {
    const state = useKnowledgeStore.getState();
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('has correct default answerMode', () => {
    expect(useKnowledgeStore.getState().settings.answerMode).toBe('Hybrid');
  });

  it('has externalRAG disabled by default', () => {
    expect(useKnowledgeStore.getState().settings.externalRAG.enabled).toBe(false);
  });

  it('updates settings', () => {
    const newSettings = {
      answerMode: 'Grounded' as const,
      externalRAG: {
        ...DEFAULT_SETTINGS.externalRAG,
        enabled: true,
        name: 'Test RAG',
        endpoint: 'https://example.com/rag',
      },
    };
    useKnowledgeStore.getState().updateSettings(newSettings);
    expect(useKnowledgeStore.getState().settings.answerMode).toBe('Grounded');
    expect(useKnowledgeStore.getState().settings.externalRAG.enabled).toBe(true);
  });
});