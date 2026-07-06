import { useCallback, useRef } from 'react';
import { MultiActionSequence } from '../types/actions';
import { useSaraActions } from './useSaraActions';
import { useSaraStore } from '../store/useSaraStore';

export function useSaraMultiActions() {
  const { dispatchAction } = useSaraActions();
  const setPrefillMessage = useSaraStore((state) => state.setPrefillMessage);
  const toggleChat = useSaraStore((state) => state.toggleChat);
  const isOpen = useSaraStore((state) => state.isOpen);
  
  // Abort controller to allow aborting sequences
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeSequence = useCallback(async (sequence: MultiActionSequence) => {
    // Cancel previous sequence if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    console.log('[Sara MultiActions] Starting sequence execution...', sequence);

    for (let i = 0; i < sequence.length; i++) {
      if (signal.aborted) {
        console.warn('[Sara MultiActions] Sequence aborted.');
        break;
      }

      const step = sequence[i];
      console.log(`[Sara MultiActions] Executing step ${i + 1}/${sequence.length}:`, step);

      try {
        if (step.stepType === 'outbound') {
          dispatchAction(step.action);
        } else if (step.stepType === 'delay') {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, step.ms);
            signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Aborted'));
            });
          });
        } else if (step.stepType === 'wait_for_event') {
          await new Promise<void>((resolve, reject) => {
            let timeoutId: ReturnType<typeof setTimeout>;

            const handleCustomEvent = (event: Event) => {
              const customEvent = event as CustomEvent<{ type: string }>;
              if (customEvent.detail?.type === step.eventName) {
                cleanup();
                resolve();
              }
            };

            const cleanup = () => {
              window.removeEventListener('sara_custom_event', handleCustomEvent);
              if (timeoutId) clearTimeout(timeoutId);
              signal.removeEventListener('abort', handleAbort);
            };

            const handleAbort = () => {
              cleanup();
              reject(new Error('Aborted'));
            };

            window.addEventListener('sara_custom_event', handleCustomEvent);
            signal.addEventListener('abort', handleAbort);

            if (step.timeoutMs) {
              timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout waiting for event: ${step.eventName}`));
              }, step.timeoutMs);
            }
          });
        } else if (step.stepType === 'internal') {
          if (step.action === 'open_chat') {
            if (!isOpen) toggleChat();
          } else if (step.action === 'close_chat') {
            if (isOpen) toggleChat();
          } else if (step.action === 'prefill_chat') {
            setPrefillMessage(step.payload);
            if (!isOpen) toggleChat();
          }
        }
      } catch (err: any) {
        if (err.message === 'Aborted') {
          break; // Stop loop silently
        }
        console.error(`[Sara MultiActions] Step ${i + 1} failed:`, err);
        // Abort the rest of the sequence on error (e.g. timeout)
        break;
      }
    }

    if (abortControllerRef.current === abortController) {
      abortControllerRef.current = null;
    }
  }, [dispatchAction, setPrefillMessage, toggleChat, isOpen]);

  const abortSequence = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { executeSequence, abortSequence };
}
