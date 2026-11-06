// Third-party API integration: Resend (https://resend.com) transactional email.
// Sends an alert to the team when a low rating (<= 2 stars) comes in.
// Fully optional — does nothing unless RESEND_API_KEY and NOTIFY_TO are set.
export async function notifyLowRating(entry) {
  const { RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_TO || entry.rating > 2) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM || 'Loop <onboarding@resend.dev>',
        to: NOTIFY_TO.split(',').map((s) => s.trim()),
        subject: `Low rating (${entry.rating}★) — ${entry.category}`,
        // Plain text (not HTML) so user-submitted content can't inject markup.
        text: `${entry.name} left a ${entry.rating}★ review in "${entry.category}":\n\n${entry.message}`,
      }),
      // Awaited (not fire-and-forget): serverless functions may be frozen once the response is sent.
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error('[notify] Resend responded', res.status, await res.text());
  } catch (err) {
    // Never fail the user's submission because the email provider is down.
    console.error('[notify] failed:', err.message);
  }
}
