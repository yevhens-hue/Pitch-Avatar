-- Migration: create interview_waitlist table
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS interview_waitlist (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  eng_level   text NOT NULL,
  target_co   text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Unique constraint on email (prevent duplicates)
ALTER TABLE interview_waitlist
  ADD CONSTRAINT interview_waitlist_email_unique UNIQUE (email);

-- Enable Row Level Security
ALTER TABLE interview_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can INSERT (public waitlist signup)
CREATE POLICY "Anyone can join waitlist"
  ON interview_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can SELECT (admin reads leads)
CREATE POLICY "Service role reads waitlist"
  ON interview_waitlist
  FOR SELECT
  TO service_role
  USING (true);
