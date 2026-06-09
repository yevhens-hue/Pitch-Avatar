-- Migration: Extend mail_domains with sender settings and Resend domain tracking
-- Up

ALTER TABLE public.mail_domains
  ADD COLUMN IF NOT EXISTS sender_name       TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_email    TEXT,
  ADD COLUMN IF NOT EXISTS invite_from_email TEXT,
  ADD COLUMN IF NOT EXISTS reminder_from_email TEXT,
  ADD COLUMN IF NOT EXISTS resend_domain_id  TEXT,
  ADD COLUMN IF NOT EXISTS dns_records       JSONB,
  ADD COLUMN IF NOT EXISTS subdomain         TEXT,
  ADD COLUMN IF NOT EXISTS region            TEXT DEFAULT 'eu-west-1';

-- Make sender_email optional (was NOT NULL previously)
ALTER TABLE public.mail_domains
  ALTER COLUMN sender_email DROP NOT NULL;

-- Back-fill defaults for existing rows
UPDATE public.mail_domains
SET
  sender_name        = COALESCE(sender_name, 'Pitch Avatar'),
  reply_to_email     = COALESCE(reply_to_email, sender_email),
  invite_from_email  = COALESCE(invite_from_email, sender_email),
  reminder_from_email = COALESCE(reminder_from_email, sender_email)
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;
