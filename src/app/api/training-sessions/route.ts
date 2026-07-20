import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple in-memory rate limit cache (Works for basic protection on Vercel Edge/Serverless)
const rateLimit = new Map<string, { count: number, timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 20;

export async function POST(request: Request) {
  try {
    // 1. Get client IP for rate limiting
    // In Vercel, the IP is in the 'x-forwarded-for' header
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    // 2. Rate limiting logic
    const now = Date.now();
    const userRate = rateLimit.get(ip);
    
    if (userRate) {
      if (now - userRate.timestamp < RATE_LIMIT_WINDOW_MS) {
        if (userRate.count >= MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' }, 
            { status: 429 }
          );
        }
        userRate.count++;
      } else {
        // Reset window
        rateLimit.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    // 3. Parse payload
    const body = await request.json();
    
    // Minimal validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 4. Forward to Supabase
    // Note: This relies on the public 'training_sessions' policy we discussed,
    // but now it's protected by this API's rate limit.
    const { data, error } = await supabase
      .from('training_sessions')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
