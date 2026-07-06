export type OutboundAction = 
  | { type: 'navigate'; route: string }
  | { type: 'start_tour'; tourId: string }
  | { type: 'open_modal'; modalId: string }
  | { type: 'custom'; eventName: string; payload?: any };

export type MultiActionStep = 
  | { stepType: 'outbound'; action: OutboundAction }
  | { stepType: 'wait_for_event'; eventName: string; timeoutMs?: number }
  | { stepType: 'delay'; ms: number }
  | { stepType: 'internal'; action: 'open_chat' | 'close_chat' | 'prefill_chat'; payload?: any };

export type MultiActionSequence = MultiActionStep[];
