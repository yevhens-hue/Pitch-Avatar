# PRD: Proactive Voice Interruption & Voice Activation for Sara AI Assistant

## Problem Statement

Currently, when the user interacts with the **Sara AI Assistant** (in `WizardChat` or `SaraWidget`), Sara plays back response guidance using the standard Web Speech API (`SpeechSynthesis`). During this time:
1. If the user wants to ask a follow-up or interrupt because they already got the answer, they have to wait for the entire audio block to finish speaking, or manually search and click the "Mute" or "Close" button.
2. If the user wants to use hands-free voice input, they must click the "Ask with voice (mic)" button *every single time* to start speaking.

From the user's perspective, this feels rigid, mechanical, and lacks the natural, smooth bidirectional flow of a real conversational human avatar.

---

## Solution

We will introduce a highly premium **Proactive Voice Interruption & Continuous Voice Activation** system for Sara.
1. **Voice Interruption (Barge-In)**: The microphone will remain in a low-power listening state while Sara is speaking (if the user has granted microphone permissions and has continuous voice mode active). If the user starts speaking, the system will instantly detect the voice threshold, call `window.speechSynthesis.cancel()`, stop Sara's playback, change her avatar state to `listening`, and capture the user's spoken words as the new input.
2. **Continuous Voice Mode**: Once activated, the microphone stays active between turns so the user can have a complete, hands-free conversation with Sara without clicking any buttons.

---

## User Stories

1. As a user, I want Sara's voice playback to instantly stop when I start speaking, so that I can interrupt her without waiting for long audio paragraphs to finish.
2. As a hands-free user, I want Sara to automatically start listening after she finishes speaking, so that I can have a continuous voice conversation without having to click the "mic" button every turn.
3. As a user, I want a visual indicator (like a pulsing ring around the microphone icon) when continuous voice mode is active, so that I know the microphone is active and ready.
4. As a user, I want the microphone to automatically mute if I am idle for more than 15 seconds, so that ambient noise doesn't accidentally trigger a query or breach my privacy.
5. As a developer, I want a robust decibel-threshold logic that ignores background noise (below 45dB) and only triggers barge-in on human speech frequencies, to prevent accidental interruptions.

---

## Implementation Decisions

### 1. Unified Interruption Hook (`useSaraVoiceInterruption`)
We will create a deep, isolated react hook `useSaraVoiceInterruption` that encapsulates:
- Initializing `SpeechRecognition` or `webkitSpeechRecognition` with `continuous: true` and `interimResults: true`.
- Initializing a Web Audio API `AudioContext` with an `AnalyserNode` to sample decibel levels and detect voice activity (VAD) locally.
- A callback interface that triggers `window.speechSynthesis.cancel()` instantly when a VAD threshold is crossed during active synthesis.

### 2. State Machine Transitions (Zustand Support Store)
We will expand `useSupportChatStore` to support a new voice mode state:
- `voiceMode: 'idle' | 'listening' | 'speaking' | 'interrupted'`
- `isContinuousVoiceActive: boolean`

### 3. API Contract & Throttle
- Continuous mic streaming will be handled strictly client-side to protect user privacy.
- Audio transcriptions will leverage the browser's native `SpeechRecognition` engine, with a fallback to a secure Whisper API route if transcription confidence falls below 0.7.

---

## Testing Decisions

### 1. Isolated Behavior Testing
We will test `useSaraVoiceInterruption` using `@testing-library/react-hooks` without rendering the full UI.
- We will mock the `AudioContext` and `AnalyserNode` to simulate decibel input.
- We will verify that when `isSpeaking` is true and a simulated high-decibel input is fed to the node, `speechSynthesis.cancel` is called.

### 2. Prior Art
Similar tests in the codebase include:
- `useSaraIdleDetector.test.ts` (which mocks timers and user activity).

---

## Out of Scope
- Custom acoustic model training (we will strictly rely on browser APIs and high-level VAD filters).
- Multilingual translation of interim spoken results (limited to user's selected widget language).

---

## Further Notes
- A local storage preference key `sara-continuous-voice` will persist the user's hands-free preference between sessions.
