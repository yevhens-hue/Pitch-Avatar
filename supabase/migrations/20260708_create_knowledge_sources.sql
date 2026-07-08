-- ============================================================
-- Knowledge Sources table
-- Stores user-uploaded files, links, and text snippets
-- that serve as sources for Coach Q&A generation and KB.
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('file', 'link', 'Text / Web', 'text')),
  size        TEXT,
  status      TEXT NOT NULL DEFAULT 'indexed',
  url         TEXT,           -- for link type
  content     TEXT,           -- for text type
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS knowledge_project_idx ON knowledge (project_id);
CREATE INDEX IF NOT EXISTS knowledge_user_idx    ON knowledge (user_id);

ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_select" ON knowledge
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "knowledge_insert" ON knowledge
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "knowledge_delete" ON knowledge
  FOR DELETE USING (user_id = auth.uid());
