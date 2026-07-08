import { NextRequest, NextResponse } from 'next/server';

// Extend Vercel function timeout to 60s (free tier max)
export const maxDuration = 60;

// Server-side only — reads CONVERTER_URL at runtime (not baked in at build time)
const CONVERTER_URL = process.env.CONVERTER_URL ?? 'https://pitch-avatar-converter.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Fire-and-forget: start the conversion without waiting.
    // The converter service writes slides directly to Supabase.
    // We return 202 immediately so Vercel doesn't timeout.
    fetch(`${CONVERTER_URL}/convert`, {
      method: 'POST',
      body: formData,
      // No AbortSignal — let it run as long as needed server-side
    }).catch(err => {
      console.error('[/api/convert] background task error:', err);
    });

    return NextResponse.json({ status: 'processing' }, { status: 202 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/convert] error:', message);
    return NextResponse.json(
      { error: `Proxy error: ${message}` },
      { status: 500 }
    );
  }
}
