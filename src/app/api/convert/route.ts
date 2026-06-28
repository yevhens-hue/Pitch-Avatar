import { NextRequest, NextResponse } from 'next/server';

// Extend Vercel function timeout to 60s (free tier max)
export const maxDuration = 60;

// Server-side only — reads CONVERTER_URL at runtime (not baked in at build time)
const CONVERTER_URL = process.env.CONVERTER_URL || 'http://localhost:8000';

// Wake up the Render service before making the real request
async function wakeUpRender(): Promise<void> {
  try {
    await fetch(`${CONVERTER_URL}/health`, {
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // ignore — main request will surface the real error
  }
}

export async function POST(req: NextRequest) {
  // Ping Render health endpoint first to wake it up if it's sleeping
  await wakeUpRender();

  try {
    const formData = await req.formData();

    const response = await fetch(`${CONVERTER_URL}/convert`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(55_000), // 55s — leaves buffer before Vercel cuts us off
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Converter returned ${response.status}: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/convert] error:', message);
    return NextResponse.json(
      { error: `Proxy error: ${message}` },
      { status: 500 }
    );
  }
}
