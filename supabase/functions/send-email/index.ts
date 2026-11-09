// Supabase Edge Function: send-email
// Sends an email in the background from asher@proactiveoutsourcing.com via SMTP.
// SMTP login lives in Supabase secrets, never in the browser.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    // Only signed-in team members may send
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return json({ error: 'Not signed in' }, 401)

    const { to, subject, body } = await req.json()
    const addr = String(to ?? '').trim()
    const subj = String(subject ?? '').replace(/[\r\n]+/g, ' ').trim()
    const text = String(body ?? '')
    if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(addr)) return json({ error: 'Invalid recipient email' }, 400)
    if (!subj || !text.trim()) return json({ error: 'Subject and message are required' }, 400)

    const host = Deno.env.get('SMTP_HOST'), username = Deno.env.get('SMTP_USER'), password = Deno.env.get('SMTP_PASS')
    if (!host || !username || !password) return json({ error: 'SMTP is not configured on the server' }, 500)
    const port = Number(Deno.env.get('SMTP_PORT') ?? 465)
    const from = Deno.env.get('SMTP_FROM') ?? 'asher@proactiveoutsourcing.com'

    const client = new SMTPClient({
      connection: { hostname: host, port, tls: port === 465, auth: { username, password } },
    })
    try {
      await client.send({
        from,
        to: addr,
        subject: subj,
        content: text,
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${esc(text).replace(/\r?\n/g, '<br>')}</div>`,
      })
    } finally {
      await client.close()
    }
    return json({ ok: true })
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500)
  }
})
