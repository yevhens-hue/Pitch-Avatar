const fs = require('fs');

const code = `graph TD
    A["Root: Any Web App Screen"] -- Mount --> B{"PostHog: chat-avatar-support?"}
    B -- Disabled --> C["Exit / Hidden"]
    B -- Enabled --> D["Load Widget : useSupportChatStore"]
    D --> E["Detect pathname & user goal"]
    E --> F["UI: Display Header Subtitle & Suggested Chips"]
    F -- User input --> G["Backend: LLM + RAG"]
    G -- Inject Prompt goal + context --> H["AI Response Generated"]
    H --> I{"Action Type?"}
    I -- Text/Video --> J["Display Bubble"]
    I -- Guideglow Tour ID --> K["Display 'Show me how' Button"]
    K -- Click --> L{"Current Screen == targetScreen?"}
    L -- Yes --> M["Guideglow.startTour"]
    L -- No --> N["navigateTo targetScreen & wait 800ms"]
    N --> M
    M --> O["PostHog: chat_avatar_tour_triggered"]`;

const state = {
  code: code,
  mermaid: "{\n  \"theme\": \"dark\"\n}",
  autoSync: true,
  updateDiagram: true
};

const base64 = Buffer.from(JSON.stringify(state)).toString('base64');
console.log('https://mermaid.live/edit#base64:' + base64);
