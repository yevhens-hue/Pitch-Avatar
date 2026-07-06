/**
 * Direct seed — no HTTP server needed.
 * Reads env from .env.local, calls OpenAI embeddings, upserts to Supabase.
 *
 * Usage: node scripts/sara-direct-seed.mjs
 */
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';

// ── Load .env.local ──────────────────────────────────────────────────────────
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(line => {
      const [k, ...v] = line.split('=');
      return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
    })
);

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const SUPABASE_URL   = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY    = env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing in .env.local');
if (!SUPABASE_URL)   throw new Error('NEXT_PUBLIC_SUPABASE_URL missing in .env.local');
if (!SERVICE_KEY)    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing in .env.local');

const openai   = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Chunking ─────────────────────────────────────────────────────────────────
function chunkText(text, size = 700, overlap = 80) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= size) return [cleaned];
  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + size, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 40) chunks.push(chunk);
    if (end >= cleaned.length) break;
    start = end - overlap;
  }
  return chunks;
}

// ── Knowledge entries ─────────────────────────────────────────────────────────
const ENTRIES = [
  {
    sourceName: 'What is Pitch Avatar',
    content: `Pitch Avatar is an AI-powered platform for creating personalized video presentations, AI chat avatars, and localizing video content into 30+ languages. Key products: Video Presentations — upload PDF or PPTX slides, choose an AI avatar and voice, generate a video where the avatar reads your script. AI Chat Avatars — create an AI assistant embedded in your website or shared via link. The avatar answers visitor questions based on your Knowledge Base (PDF, URLs, text). Video Localization — dub existing MP4 videos into other languages with automatic lip-sync. Main use cases: Sales pitches, HR onboarding, product demos, customer support bots, e-learning, multilingual content.`,
  },
  {
    sourceName: 'How to create a Chat Avatar',
    content: `Creating an AI Chat Avatar takes 4 steps. Step 1 Basic Setup: Enter your avatar name, select voice and language, upload a photo or choose from the Avatar library, click Next. Step 2 Pitch Content: Click Add new to upload a new presentation PDF or PPTX or select a previously uploaded one. For a Chat Widget without slides check the box I want to get my avatar as a chat widget without slides. Step 3 Avatar Instructions: Select the Chat Avatar role from Demo, Sales Consultant, Customer Success, HR Manager, Support, Marketing, Project Manager, or Blank. Write the Greeting message shown to visitors when the chat opens. Write custom Instructions which is the system prompt for the AI. Add Knowledge Base files such as PDFs, URLs, or text so the avatar can answer questions accurately. Click Save. Step 4 Share: Copy the share link or embed code. For a website widget paste the code snippet into your site HTML.`,
  },
  {
    sourceName: 'Plans and Pricing',
    content: `Pitch Avatar subscription plans. Free Trial lasts 7 days and includes 1 presenter, 10 presentations, 12 AI avatar minutes, 50 share links per month, and 5 simultaneous listeners. Professional plan includes 1 presenter, 10 presentations, 20 AI avatar minutes, 500 share links per month, 20 simultaneous listeners, and custom branding. Business plan includes 5 or more presenters, 100 presentations, 50 AI avatar minutes, 5000 share links per month, and 50 simultaneous listeners. Enterprise plan includes 30 or more presenters, custom limits, unlimited share links, and dedicated support. AI Avatar Minutes rules: Subscription minutes renew each billing period. Unused subscription minutes do NOT carry over to next period. Subscription minutes are consumed first. Purchased minutes bought separately never expire and stay on balance until fully used. You can buy additional minutes from the Billing section any time.`,
  },
  {
    sourceName: 'Supported File Formats',
    content: `Pitch Avatar supports the following file formats. Presentations: PDF, PPT, PPTX up to 100 MB. Videos: MP4 for localization and upload. Knowledge Base: PDF, DOCX, TXT text documents, and website URLs which are scraped automatically. When uploading presentations slides are converted to images automatically. Scripts can be added per slide in the editor. PPTX notes are imported as script text automatically. For video localization upload an MP4 source video, choose the target language, select a voice for dubbing, and the system generates lip-sync automatically.`,
  },
  {
    sourceName: 'Custom Domain Setup',
    content: `Custom Domain setup for Pitch Avatar is available on Professional, Business, and Enterprise plans. Steps: Go to Account Settings and then Custom Domain. Enter your domain with subdomain for example pitch.yourcompany.com. Click Add Domain. Add the provided CNAME record to your DNS provider such as Cloudflare, GoDaddy, or Namecheap. Wait for SSL certificate issuance via Cloudfront Distribution which can take up to 72 hours. After setup your presentations and chat avatars will be accessible via your custom domain instead of the default app.pitchavatar.com URL.`,
  },
  {
    sourceName: 'Knowledge Base for Chat Avatars',
    content: `The Knowledge Base is what makes your Chat Avatar smart and accurate. What to add: Company information about products and services, FAQ documents, Price lists, Product manuals or spec sheets, Support articles, any document your AI should reference. Supported formats are PDF, DOCX, TXT, and website URLs. How to add: During Chat Avatar creation in Step 3 Avatar Instructions there is a Knowledge Base section. After creation open the avatar in the editor and click Knowledge Base tab. Upload PDF or DOCX files or paste URLs. The content is automatically parsed and indexed for the AI. Best practices: Keep documents focused on one topic per file. Use clear headings. Update knowledge base when products or prices change. The AI answers questions based only on what is in the knowledge base.`,
  },
  {
    sourceName: 'Analytics and Tracking',
    content: `Pitch Avatar Analytics tracks viewer engagement with your presentations and chat avatars. Available metrics: Total views unique and repeat, Average watch time and completion rate, Drop-off by slide showing where viewers stop watching, Chat interactions count, Questions asked to AI avatars, Lead contacts collected including name and email if viewer fills contact form. Filtering options: By project or presentation, By date range, By assignment or enrollment link. Enrollments for personalized tracking: Create an enrollment link to track a specific viewer by name. See whether they opened and watched and how much they engaged. Bulk enrollment via CSV upload. Set quotas for max views per link. Use for HR onboarding, sales follow-ups, or learning programs.`,
  },
  {
    sourceName: 'Integrations and Embed',
    content: `Pitch Avatar integrations. Native integrations found in Settings under Integrations: HubSpot CRM syncs viewer contacts and engagement data to HubSpot deals. Zapier connects to 5000 plus apps such as triggering on new viewer, sending to Slack, or adding to Google Sheets. Webhooks receive real-time POST events when viewers watch, interact, or submit contact info. Embedding on your website: For Chat Avatar copy the JavaScript embed snippet from the avatar Share page. Paste it into your website HTML before the closing body tag. The widget appears as a floating button. Share links: Every presentation or chat avatar has a unique share URL. Links can be public for anyone with the link or private requiring login. Custom domains can be applied to all your share links.`,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🧠 Sara Knowledge Base — Direct Seed (no HTTP server)\n');

  let ok = 0, fail = 0;

  for (const entry of ENTRIES) {
    try {
      const chunks = chunkText(entry.content);
      console.log(`  → ${entry.sourceName} (${chunks.length} chunk(s))...`);

      // Generate embeddings one at a time to avoid rate limits
      const embeddings = [];
      for (const chunk of chunks) {
        const res = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
          encoding_format: 'float',
        });
        embeddings.push(res.data[0].embedding);
        await new Promise(r => setTimeout(r, 150));
      }

      // Delete old
      await supabase
        .from('sara_knowledge_chunks')
        .delete()
        .eq('source_name', entry.sourceName)
        .is('project_id', null);

      // Insert new — embedding must be an array, NOT a JSON string
      const rows = chunks.map((chunk, i) => ({
        source_type: 'manual',
        source_name: entry.sourceName,
        content: chunk,
        embedding: embeddings[i],   // raw float[] — Supabase JS handles serialization
        project_id: null,
      }));

      const { error } = await supabase.from('sara_knowledge_chunks').insert(rows);
      if (error) throw new Error(error.message);

      console.log(`  ✅ ${entry.sourceName} → ${chunks.length} chunk(s) ingested`);
      ok++;

      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`  ❌ ${entry.sourceName}: ${e.message}`);
      fail++;
    }
  }

  const { count } = await supabase
    .from('sara_knowledge_chunks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total chunks in DB: ${count}`);
  console.log(`✅ Seed done: ${ok} ok, ${fail} failed\n`);

  if (fail > 0) process.exit(1);
}

run().catch(e => { console.error('💥', e.message); process.exit(1); });
