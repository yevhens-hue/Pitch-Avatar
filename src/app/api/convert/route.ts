import { NextRequest, NextResponse } from 'next/server';

// Server-side only — reads CONVERTER_URL at runtime (not baked in at build time)
const CONVERTER_URL = process.env.CONVERTER_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(`${CONVERTER_URL}/convert`, {
      method: 'POST',
      body: formData,
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
    return NextResponse.json(
      { error: `Proxy error: ${message}` },
      { status: 500 }
    );
  }
}
