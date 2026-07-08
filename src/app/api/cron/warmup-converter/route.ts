import { NextResponse } from 'next/server';

// Keep the Render free-tier converter service warm.
// Called every 10 min by Vercel Cron (see vercel.json).
// Without this, Render shuts down after 15 min of inactivity
// and cold starts take ~50s, causing Vercel timeout on convert.
export const maxDuration = 15;

const CONVERTER_URL =
  process.env.CONVERTER_URL ?? 'https://pitch-avatar-converter.onrender.com';

export async function GET() {
  try {
    const res = await fetch(`${CONVERTER_URL}/health`, {
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    console.log('[warmup-converter] Converter is warm:', data);
    return NextResponse.json({ ok: true, converter: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[warmup-converter] Ping failed:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
