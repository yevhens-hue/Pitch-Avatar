import { useSupportChatStore } from '@/lib/supportStore';

describe('useSupportChatStore', () => {
  beforeEach(() => {
    useSupportChatStore.getState().clearHistory();
  });

  describe('initial state', () => {
    it('starts with chat closed', () => {
      const state = useSupportChatStore.getState();
      expect(state.isOpen).toBe(false);
    });

    it('starts with empty messages', () => {
      const state = useSupportChatStore.getState();
      expect(state.messages).toEqual([]);
    });

    it('starts with muted false', () => {
      const state = useSupportChatStore.getState();
      expect(state.isMuted).toBe(false);
    });

    it('starts with hasBeenOpened false', () => {
      const state = useSupportChatStore.getState();
      expect(state.hasBeenOpened).toBe(false);
    });
  });

  describe('openChat', () => {
    it('opens the chat', () => {
      useSupportChatStore.getState().openChat();
      expect(useSupportChatStore.getState().isOpen).toBe(true);
    });

    it('sets hasBeenOpened to true', () => {
      useSupportChatStore.getState().openChat();
      expect(useSupportChatStore.getState().hasBeenOpened).toBe(true);
    });
  });

  describe('closeChat', () => {
    it('closes the chat without affecting hasBeenOpened', () => {
      useSupportChatStore.getState().openChat();
      useSupportChatStore.getState().closeChat();
      expect(useSupportChatStore.getState().isOpen).toBe(false);
      expect(useSupportChatStore.getState().hasBeenOpened).toBe(true);
    });
  });

  describe('toggleChat', () => {
    it('toggles chat from closed to open', () => {
      useSupportChatStore.getState().toggleChat();
      expect(useSupportChatStore.getState().isOpen).toBe(true);
    });

    it('toggles chat from open to closed', () => {
      useSupportChatStore.getState().openChat();
      useSupportChatStore.getState().toggleChat();
      expect(useSupportChatStore.getState().isOpen).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('adds a user message', () => {
      useSupportChatStore.getState().addMessage({
        role: 'user',
        text: 'Hello',
      });
      const messages = useSupportChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].text).toBe('Hello');
    });

    it('adds an AI message with source', () => {
      useSupportChatStore.getState().addMessage({
        role: 'ai',
        text: 'Hi there!',
        source: 'Knowledge Base',
      });
      const messages = useSupportChatStore.getState().messages;
      expect(messages[0].source).toBe('Knowledge Base');
    });

    it('generates unique id for each message', () => {
      useSupportChatStore.getState().addMessage({ role: 'user', text: 'Test 1' });
      useSupportChatStore.getState().addMessage({ role: 'user', text: 'Test 2' });
      const messages = useSupportChatStore.getState().messages;
      expect(messages[0].id).not.toBe(messages[1].id);
    });

    it('adds timestamp to messages', () => {
      useSupportChatStore.getState().addMessage({ role: 'user', text: 'Test' });
      const messages = useSupportChatStore.getState().messages;
      expect(messages[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('setMuted', () => {
    it('sets muted state', () => {
      useSupportChatStore.getState().setMuted(true);
      expect(useSupportChatStore.getState().isMuted).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('clears all messages', () => {
      useSupportChatStore.getState().addMessage({ role: 'user', text: 'Test' });
      useSupportChatStore.getState().clearHistory();
      expect(useSupportChatStore.getState().messages).toEqual([]);
    });
  });
});