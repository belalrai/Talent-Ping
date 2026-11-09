# TalentPing

CV parser and candidate outreach tool for Proactive Outsourcing.
Upload CVs, extract name / phone / email, then contact candidates by **WhatsApp** or **Email**,
each with its own template and its own status.

## Features
- Sign in with email + password, forgot-password link, Google, Outlook/Microsoft and Yahoo
- CV parsing (PDF / DOCX) in the browser
- Separate WhatsApp and Email templates (`{first_name}`, `{full_name}`)
- Separate WhatsApp status and Email status per candidate (pending / sent / failed)
- Email is sent automatically in the background from `asher@proactiveoutsourcing.com` (no Outlook or mail window opens)
- Shared team data through Supabase

## Project structure
```
index.html                              the whole front-end app
supabase/setup.sql                      database columns for email status + template type
supabase/functions/send-email/index.ts  Edge Function that sends email over SMTP
```

## Setup

### 1. Database
Supabase → SQL Editor → paste and run `supabase/setup.sql`.

### 2. Email function
Supabase → Edge Functions → create `send-email`, paste `supabase/functions/send-email/index.ts`, deploy.
(CLI alternative: `supabase functions deploy send-email`.)

Add these **secrets** (never commit them to GitHub):

| Secret      | Example                                   |
|-------------|-------------------------------------------|
| `SMTP_HOST` | your email provider's SMTP server         |
| `SMTP_PORT` | `465` (or `587`)                          |
| `SMTP_USER` | `asher@proactiveoutsourcing.com`          |
| `SMTP_PASS` | mailbox password / app password           |
| `SMTP_FROM` | optional, defaults to the address above   |

CLI: `supabase secrets set SMTP_HOST=... SMTP_PORT=465 SMTP_USER=... SMTP_PASS=...`

### 3. Sign-in options
Supabase → Authentication:
- **URL Configuration**: set Site URL and add your app address to Redirect URLs (needed for the password-reset link).
- **Providers**: enable Google and Azure (Microsoft). For Yahoo, add a Custom Provider with identifier `custom:yahoo` (OIDC).

### 4. Supabase keys
Open `index.html` and set `SB_URL` and `SB_KEY` (the anon/public key) near the top of the script.
Keep Row Level Security enabled on all tables.

### 5. Hosting
It is a single static file. GitHub Pages works: Settings → Pages → deploy from the `main` branch, root folder.
Then use the Pages address as the Site URL / Redirect URL in step 3.
