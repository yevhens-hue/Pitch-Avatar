-- ============================================================
-- Sara AI Widget — Knowledge Base (RAG)
-- Migration: 20260707_create_sara_knowledge_base.sql
--
-- Creates a vector knowledge store for Sara's RAG pipeline.
-- Uses pgvector (already enabled in Supabase by default).
-- Each row is a text chunk from an ingested document,
-- stored alongside its OpenAI text-embedding-3-small vector.
-- ============================================================

-- Enable pgvector extension (safe no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Main knowledge chunks table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sara_knowledge_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source document metadata
  source_type   TEXT NOT NULL CHECK (source_type IN ('manual', 'pdf', 'url', 'page_context')),
  source_name   TEXT NOT NULL,          -- filename, URL, or label
  source_url    TEXT,                   -- optional original URL

  -- The actual text chunk (for LLM context injection)
  content       TEXT NOT NULL,

  -- OpenAI text-embedding-3-small produces 1536-dim vectors
  embedding     vector(1536),

  -- Scope: global knowledge (NULL) or project-specific
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Lifecycle
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
-- IVFFlat index for cosine similarity ANN search (tune lists= sqrt(row count))
CREATE INDEX IF NOT EXISTS sara_chunks_embedding_idx
  ON sara_knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Fast filter by project
CREATE INDEX IF NOT EXISTS sara_chunks_project_idx
  ON sara_knowledge_chunks (project_id);

-- Fast filter by source type
CREATE INDEX IF NOT EXISTS sara_chunks_source_type_idx
  ON sara_knowledge_chunks (source_type);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_sara_chunks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sara_chunks_updated_at ON sara_knowledge_chunks;
CREATE TRIGGER trg_sara_chunks_updated_at
  BEFORE UPDATE ON sara_knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION update_sara_chunks_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE sara_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read global chunks (project_id IS NULL)
-- and chunks belonging to their own projects
CREATE POLICY "sara_chunks_read" ON sara_knowledge_chunks
  FOR SELECT
  USING (
    project_id IS NULL
    OR project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Only service role (backend) can insert / update / delete
CREATE POLICY "sara_chunks_insert_service" ON sara_knowledge_chunks
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "sara_chunks_update_service" ON sara_knowledge_chunks
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "sara_chunks_delete_service" ON sara_knowledge_chunks
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ── Similarity search function ────────────────────────────────────────────────
-- Returns the top-k most similar chunks for a given query embedding.
-- Uses cosine distance (1 - cosine_similarity).
-- Accepts an optional project_id to scope search.
CREATE OR REPLACE FUNCTION match_sara_chunks(
  query_embedding  vector(1536),
  match_threshold  FLOAT    DEFAULT 0.70,
  match_count      INT      DEFAULT 5,
  p_project_id     UUID     DEFAULT NULL
)
RETURNS TABLE (
  id          UUID,
  source_name TEXT,
  source_type TEXT,
  content     TEXT,
  similarity  FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as function owner, bypasses RLS for the search
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.source_name,
    c.source_type,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM sara_knowledge_chunks c
  WHERE
    -- Scope: global OR matching project
    (c.project_id IS NULL OR c.project_id = p_project_id)
    -- Pre-filter by threshold to skip obvious mismatches
    AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
  ORDER BY c.embedding <=> query_embedding   -- ASC = most similar first
  LIMIT match_count;
END;
$$;

-- ── Seed: Static Sara knowledge (product manual) ──────────────────────────────
-- These rows have NO embedding yet — the ingest API will backfill them
-- via /api/sara/ingest on first run. We just reserve the source_name.
-- (Optional: remove if you prefer fully API-driven ingestion)
INSERT INTO sara_knowledge_chunks (source_type, source_name, content, project_id)
VALUES
  (
    'manual',
    'Pitch Avatar — Product Overview',
    'Pitch Avatar is an AI-powered platform for creating personalized video presentations, AI chat avatars, and localizing video content into 30+ languages. Key products: (1) Video Presentations — upload slides + AI avatar reads the script; (2) Chat Avatars — an embedded AI assistant that answers visitor questions from a knowledge base; (3) Video Localization — dub existing videos into other languages with lip-sync.',
    NULL
  ),
  (
    'manual',
    'Pitch Avatar — Plans & Pricing',
    'Free Trial: 7 days, 1 presenter, 10 presentations, 12 avatar minutes, 50 share links/month. Professional: 1 presenter, 10 presentations, 20 avatar minutes, 500 links/month, 20 simultaneous listeners. Business: 5 presenters, 100 presentations, 50 minutes, 5000 links, 50 listeners. Enterprise: 30+ presenters, custom limits, unlimited links, dedicated support.',
    NULL
  ),
  (
    'manual',
    'Pitch Avatar — How to create a Chat Avatar',
    'Step 1 (Basic Setup): Enter avatar name, select voice and language, upload a photo or choose from the Avatar library. Step 2 (Pitch Content): Link an existing presentation or upload a new PDF/PPTX. Check "chat widget without slides" for a pure chat experience. Step 3 (Avatar Instructions): Choose a role (Sales, HR, Demo, Support, etc.), write a Greeting and custom Instructions, upload Knowledge Base files (PDF, links, text). Click Save to get the embed code.',
    NULL
  ),
  (
    'manual',
    'Pitch Avatar — Custom Domain Setup',
    'Custom Domain is available on Professional, Business, and Enterprise plans. Go to Account Settings > Custom Domain. Enter your domain with subdomain and click Add Domain. Add the CNAME records shown to your DNS provider. SSL certificate issuance may take up to 72 hours (Cloudfront distribution).',
    NULL
  ),
  (
    'manual',
    'Pitch Avatar — AI Avatar Minutes',
    'Subscription Minutes renew each billing period. Unused subscription minutes do NOT carry over to the next period. They are consumed first. Purchased Minutes (bought separately) never expire and remain on your balance until fully used. You can buy additional minutes any time from the Billing section.',
    NULL
  )
ON CONFLICT DO NOTHING;
