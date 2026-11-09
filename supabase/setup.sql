-- Run once in Supabase → SQL Editor, BEFORE using the new index.html

alter table public.candidates
  add column if not exists email_status   text default 'new',
  add column if not exists email_sent_at  text default '',
  add column if not exists email_campaign text default '',
  add column if not exists email_subject  text default '',
  add column if not exists email_msg      text default '',
  add column if not exists email_error    text default '';

alter table public.templates
  add column if not exists kind    text default 'wa',   -- 'wa' = WhatsApp, 'email' = Email
  add column if not exists subject text default '';
