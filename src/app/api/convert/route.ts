import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';

// Extend Vercel function timeout to 60s (free tier max)
export const maxDuration = 60;

// Server-side only — reads CONVERTER_URL at runtime (not baked in at build time)
const CONVERTER_URL = process.env.CONVERTER_URL ?? 'https://pitch-avatar-converter.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Use next/server `after()` — runs AFTER response is sent, keeps execution alive on Vercel.
    // This is the correct way to do background work without timing out.
    after(async () => {
      try {
        const res = await fetch(`${CONVERTER_URL}/convert`, {
          method: 'POST',
          body: formData,
          // No AbortSignal — allow as long as needed
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error(`[/api/convert] converter returned ${res.status}: ${txt}`);
        } else {
          console.log('[/api/convert] conversion completed successfully');
        }
      } catch (err) {
        console.error('[/api/convert] background conversion error:', err);
      }
    });

    // Return 202 immediately — converter will write slides to Supabase in the background
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
