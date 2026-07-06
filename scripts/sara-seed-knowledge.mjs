#!/usr/bin/env node
/**
 * scripts/sara-seed-knowledge.mjs
 *
 * Seeds Sara's RAG knowledge base with product documentation.
 * Run AFTER applying the Supabase migration:
 *   supabase db push   (or paste the migration SQL in Supabase Dashboard)
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/sara-seed-knowledge.mjs
 *
 * Optional — restrict ingest endpoint with an API key:
 *   SARA_INGEST_API_KEY=your-secret-key
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const INGEST_API_KEY = process.env.SARA_INGEST_API_KEY || '';

// ── Product knowledge chunks ─────────────────────────────────────────────────
// Each entry will be chunked, embedded, and stored in sara_knowledge_chunks.
const KNOWLEDGE_ENTRIES = [
  {
    sourceName: 'Pitch Avatar — What is Pitch Avatar',
    sourceType: 'manual',
    content: `Pitch Avatar is an AI-powered platform for creating personalized video presentations, AI chat avatars, and localizing video content into 30+ languages.

Key products:
1. Video Presentations — upload PDF/PPTX slides, choose an AI avatar and voice, generate a video where the avatar reads your script.
2. AI Chat Avatars — create an AI assistant embedded in your website or shared via link. The avatar answers visitor questions based on your Knowledge Base (PDF, URLs, text).
3. Video Localization — dub existing MP4 videos into other languages with automatic lip-sync.

Main use cases: Sales pitches, HR onboarding, product demos, customer support bots, e-learning, multilingual content.`,
  },
  {
    sourceName: 'Pitch Avatar — How to create a Chat Avatar',
    sourceType: 'manual',
    content: `Creating an AI Chat Avatar takes 4 steps:

Step 1 — Basic Setup:
- Enter your avatar's name
- Select voice and language
- Upload a photo or choose from the Avatar library
- Click Next

Step 2 — Pitch Content:
- Click "Add new" to upload a new presentation (PDF or PPTX)
- Or select a previously uploaded one
- For a Chat Widget without slides: check "I want to get my avatar as a chat widget without slides"

Step 3 — Avatar Instructions:
- Select the Chat Avatar's role: Demo, Sales Consultant, Customer Success, HR Manager, Support, Marketing, Project Manager, or Blank
- Write the Greeting message (shown to visitors when the chat opens)
- Write custom Instructions (the system prompt / persona for the AI)
- Add Knowledge Base files (PDFs, URLs, or text) so the avatar can answer questions accurately
- Click Save

Step 4 — Share:
- Copy the share link or embed code
- For a website widget: paste the code snippet into your site's HTML`,
  },
  {
    sourceName: 'Pitch Avatar — Plans and Pricing',
    sourceType: 'manual',
    content: `Pitch Avatar subscription plans:

Free Trial (7 days):
- 1 presenter
- 10 presentations
- 12 AI avatar minutes
- 50 share links per month
- 5 simultaneous listeners

Professional plan:
- 1 presenter
- 10 presentations
- 20 AI avatar minutes
- 500 share links per month
- 20 simultaneous listeners
- Custom branding

Business plan:
- 5 or more presenters
- 100 presentations
- 50 AI avatar minutes
- 5000 share links per month
- 50 simultaneous listeners

Enterprise plan:
- 30 or more presenters
- Custom limits
- Unlimited share links
- Dedicated support

AI Avatar Minutes rules:
- Subscription minutes renew each billing period
- Unused subscription minutes do NOT carry over to next period
- Subscription minutes are consumed first
- Purchased minutes (bought separately) never expire and stay on balance until fully used
- Buy additional minutes from the Billing section any time`,
  },
  {
    sourceName: 'Pitch Avatar — Supported File Formats',
    sourceType: 'manual',
    content: `Pitch Avatar supports the following file formats:

Presentations: PDF, PPT, PPTX (up to 100 MB)
Videos: MP4 (for localization and upload)
Knowledge Base: PDF, DOCX, TXT (text documents), website URLs (scraped automatically)

When uploading presentations:
- Slides are converted to images automatically
- Scripts can be added per slide in the editor
- PPTX notes are imported as script text automatically

For video localization:
- Upload an MP4 source video
- Choose the target language
- Select a voice for dubbing
- The system generates lip-sync automatically`,
  },
  {
    sourceName: 'Pitch Avatar — Custom Domain Setup',
    sourceType: 'manual',
    content: `Custom Domain setup for Pitch Avatar:

Requirements: Available on Professional, Business, and Enterprise plans.

Steps:
1. Go to Account Settings > Custom Domain
2. Enter your domain with subdomain (e.g., pitch.yourcompany.com)
3. Click Add Domain
4. Add the provided CNAME record to your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.)
5. Wait for SSL certificate issuance via Cloudfront Distribution — can take up to 72 hours

After setup: Your presentations and chat avatars will be accessible via your custom domain instead of the default app.pitchavatar.com URL.`,
  },
  {
    sourceName: 'Pitch Avatar — Knowledge Base for Chat Avatars',
    sourceType: 'manual',
    content: `The Knowledge Base is what makes your Chat Avatar smart and accurate.

What to add to Knowledge Base:
- Company information (about us, products, services)
- FAQ documents
- Price lists
- Product manuals or spec sheets
- Support articles
- Any document your AI should be able to reference

Supported formats: PDF, DOCX, TXT, website URLs

How to add Knowledge Base content:
1. During Chat Avatar creation: Step 3 (Avatar Instructions) includes a Knowledge Base section
2. After creation: Open the avatar in the editor, click "Knowledge Base" tab
3. Upload PDF/DOCX files or paste URLs
4. The content is automatically parsed and indexed for the AI

Best practices:
- Keep documents focused on one topic per file
- Use clear headings in your documents
- Update knowledge base when products or prices change
- The AI answers questions based ONLY on what is in the knowledge base (no hallucinations)`,
  },
  {
    sourceName: 'Pitch Avatar — Analytics and Tracking',
    sourceType: 'manual',
    content: `Pitch Avatar Analytics tracks viewer engagement with your presentations and chat avatars.

Available metrics:
- Total views (unique and repeat)
- Average watch time and completion rate
- Drop-off by slide (where viewers stop watching)
- Chat interactions count
- Questions asked to AI avatars
- Lead contacts collected (name, email if viewer fills contact form)

Filtering options:
- By project or presentation
- By date range
- By assignment (enrollment link)

Enrollments (personalized tracking):
- Create an enrollment link to track a specific viewer by name
- See whether they opened, watched, and how much they engaged
- Bulk enrollment via CSV upload
- Set quotas (max views per link)
- Use for HR onboarding, sales follow-ups, or learning programs`,
  },
  {
    sourceName: 'Pitch Avatar — Integrations and API',
    sourceType: 'manual',
    content: `Pitch Avatar integrations:

Native integrations (Settings > Integrations):
- HubSpot CRM — sync viewer contacts and engagement data to HubSpot deals
- Zapier — connect to 5000+ apps (trigger on new viewer, send to Slack, add to Google Sheets, etc.)
- Webhooks — receive real-time POST events when viewers watch, interact, or submit contact info

Embedding on your website:
- Chat Avatar: Copy the JavaScript embed snippet from the avatar's Share page
- Paste into your website's HTML before the closing </body> tag
- The widget appears as a floating button

Share links:
- Every presentation or chat avatar has a unique share URL
- Links can be set to public (anyone with link) or private (requires login)
- Custom domains can be applied to all your share links`,
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function ingest(entry) {
  const headers = {
    'Content-Type': 'application/json',
    ...(INGEST_API_KEY ? { Authorization: `Bearer ${INGEST_API_KEY}` } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/sara/ingest`, {
    method: 'POST',
    headers,
    body: JSON.stringify(entry),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`  ✗ FAILED: ${entry.sourceName} — ${data.error}`);
    return false;
  }

  console.log(
    `  ✓ ${entry.sourceName} → ${data.chunksIngested} chunk(s) ingested`
  );
  return true;
}

async function main() {
  console.log(`\n🧠 Sara Knowledge Base Seed`);
  console.log(`   Target: ${BASE_URL}/api/sara/ingest`);
  console.log(`   Entries: ${KNOWLEDGE_ENTRIES.length}\n`);

  let success = 0;
  let failed = 0;

  for (const entry of KNOWLEDGE_ENTRIES) {
    const ok = await ingest(entry);
    if (ok) success++;
    else failed++;

    // Rate-limit: avoid hitting OpenAI embeddings API too fast
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Done: ${success} ingested, ${failed} failed\n`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
