# Vertical Slices / Issues Breakdown: Proactive Voice Interruption

We have decomposed the **Sara Voice Interruption & Continuous Activation** PRD into **3 tracer-bullet vertical slices**. Each slice cuts through all layers (state, logic, UI, and tests) and is fully verifiable on its own.

---

## 1. Issue #101 [AFK]: Core Voice Interruption Engine (`useSaraVoiceInterruption`)
*   **Blocked by**: None (Can start immediately)
*   **User stories covered**: US-01, US-05
*   **What to build**: 
    A fully isolated react hook `useSaraVoiceInterruption` that listens to continuous browser audio input via an local `AudioContext` decibel analyzer. If active synthesis is detected and input volume crosses a default `45dB` threshold, it triggers `window.speechSynthesis.cancel()` immediately to silence playback and outputs an `onInterrupt` callback event.
*   **Acceptance criteria**:
    - [ ] `useSaraVoiceInterruption` hook exports `isListening`, `isInterrupted`, and VAD trigger thresholds.
    - [ ] Hook integrates local Web Audio analyzer and calls `speechSynthesis.cancel()` when decibel levels exceed threshold during active mock speaking.
    - [ ] Unit tests mock `AudioContext` nodes and verify interruption callback fires with 100% test coverage.

---

## 2. Issue #102 [AFK]: Zustand Support Store State Machine Expansion
*   **Blocked by**: Issue #101
*   **User stories covered**: US-02, US-04
*   **What to build**: 
    Expand `useSupportChatStore` state and transition actions to support continuous mic activation modes, hands-free options, and transitioning the avatar states dynamically (`idle` -> `speaking` -> `interrupted` -> `listening` -> `thinking`).
*   **Acceptance criteria**:
    - [ ] `useSupportChatStore` includes `isContinuousVoiceActive: boolean` and `voiceMode` states.
    - [ ] State transitions (`startListening`, `stopSpeaking`, `triggerInterruption`) are fully implemented and validated.
    - [ ] 15-second idle timeout automatically resets state to `idle` and suspends mic activity to protect user privacy.
    - [ ] Unit tests cover all state transitions and idle resets.

---

## 3. Issue #103 [HITL]: Proactive Bubble Visual integration & Microphone Ring UI
*   **Blocked by**: Issue #102
*   **User stories covered**: US-03
*   **What to build**: 
    Integrate the newly updated voice states into `WizardChat` and `SaraWidget` UI. Add a premium pulsing visual ring around the microphone icon to represent active continuous voice capture, and bind verbal inputs directly to the conversational pipeline.
*   **Acceptance criteria**:
    - [ ] Pulse ring animations are implemented in pure module CSS and active *only* when mic is recording or listening.
    - [ ] Microphone icon highlights green when hands-free continuous voice is active.
    - [ ] Manual design review (HITL) with design leads confirms avatar response transitions look premium and fluid.
