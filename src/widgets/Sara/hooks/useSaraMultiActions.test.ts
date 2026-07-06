import { renderHook, act } from '@testing-library/react';
import { useSaraMultiActions } from './useSaraMultiActions';
import { useSaraStore } from '../store/useSaraStore';
import { useSaraActions } from './useSaraActions';
import { MultiActionSequence } from '../types/actions';

// Mock store and actions
jest.mock('../store/useSaraStore', () => ({
  useSaraStore: jest.fn(),
}));

jest.mock('./useSaraActions', () => ({
  useSaraActions: jest.fn(),
}));

describe('useSaraMultiActions', () => {
  let mockDispatchAction: jest.Mock;
  let mockSetPrefillMessage: jest.Mock;
  let mockToggleChat: jest.Mock;
  let mockStoreState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockDispatchAction = jest.fn();
    (useSaraActions as jest.Mock).mockReturnValue({
      dispatchAction: mockDispatchAction,
    });

    mockSetPrefillMessage = jest.fn();
    mockToggleChat = jest.fn();

    mockStoreState = {
      isOpen: false,
      setPrefillMessage: mockSetPrefillMessage,
      toggleChat: mockToggleChat,
    };

    (useSaraStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector(mockStoreState)
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should execute a simple sequence of outbound actions', async () => {
    const { result } = renderHook(() => useSaraMultiActions());

    const sequence: MultiActionSequence = [
      { stepType: 'outbound', action: { type: 'navigate', route: '/home' } },
      { stepType: 'outbound', action: { type: 'start_tour', tourId: '123' } },
    ];

    await act(async () => {
      await result.current.executeSequence(sequence);
    });

    expect(mockDispatchAction).toHaveBeenCalledTimes(2);
    expect(mockDispatchAction).toHaveBeenNthCalledWith(1, { type: 'navigate', route: '/home' });
    expect(mockDispatchAction).toHaveBeenNthCalledWith(2, { type: 'start_tour', tourId: '123' });
  });

  it('should respect delay steps', async () => {
    const { result } = renderHook(() => useSaraMultiActions());

    const sequence: MultiActionSequence = [
      { stepType: 'outbound', action: { type: 'navigate', route: '/home' } },
      { stepType: 'delay', ms: 1000 },
      { stepType: 'outbound', action: { type: 'start_tour', tourId: '123' } },
    ];

    let promise: Promise<void>;
    act(() => {
      promise = result.current.executeSequence(sequence);
    });

    expect(mockDispatchAction).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    // Still waiting
    expect(mockDispatchAction).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    // Delay finished
    await act(async () => {
      await promise;
    });

    expect(mockDispatchAction).toHaveBeenCalledTimes(2);
    expect(mockDispatchAction).toHaveBeenNthCalledWith(2, { type: 'start_tour', tourId: '123' });
  });

  it('should wait for a custom event before proceeding', async () => {
    const { result } = renderHook(() => useSaraMultiActions());

    const sequence: MultiActionSequence = [
      { stepType: 'wait_for_event', eventName: 'page_loaded' },
      { stepType: 'outbound', action: { type: 'start_tour', tourId: '123' } },
    ];

    let promise: Promise<void>;
    act(() => {
      promise = result.current.executeSequence(sequence);
    });

    // Before event, nothing should happen
    expect(mockDispatchAction).not.toHaveBeenCalled();

    // Trigger the event
    act(() => {
      window.dispatchEvent(new CustomEvent('sara_custom_event', { detail: { type: 'page_loaded' } }));
    });

    await act(async () => {
      await promise;
    });

    expect(mockDispatchAction).toHaveBeenCalledTimes(1);
    expect(mockDispatchAction).toHaveBeenCalledWith({ type: 'start_tour', tourId: '123' });
  });

  it('should timeout and abort if event is not received in time', async () => {
    const { result } = renderHook(() => useSaraMultiActions());

    const sequence: MultiActionSequence = [
      { stepType: 'wait_for_event', eventName: 'never_happens', timeoutMs: 1000 },
      { stepType: 'outbound', action: { type: 'start_tour', tourId: '123' } },
    ];

    let promise: Promise<void>;
    act(() => {
      promise = result.current.executeSequence(sequence);
    });

    act(() => {
      jest.advanceTimersByTime(1500); // Exceed timeout
    });

    await act(async () => {
      await promise;
    });

    // It should have aborted, so the second step is not executed
    expect(mockDispatchAction).not.toHaveBeenCalled();
  });

  it('should handle internal widget actions properly', async () => {
    const { result } = renderHook(() => useSaraMultiActions());

    const sequence: MultiActionSequence = [
      { stepType: 'internal', action: 'open_chat' },
      { stepType: 'internal', action: 'prefill_chat', payload: 'Hello' },
    ];

    await act(async () => {
      await result.current.executeSequence(sequence);
    });

    // isOpen is false in mock state, so toggleChat should be called
    expect(mockToggleChat).toHaveBeenCalledTimes(2); 
    expect(mockSetPrefillMessage).toHaveBeenCalledWith('Hello');
  });
});
