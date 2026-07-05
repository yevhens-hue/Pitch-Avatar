'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const WaitlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  eng_level: z.enum(['B1 – Intermediate', 'B2 – Upper Intermediate', 'C1 – Advanced'] as const, {
    errorMap: () => ({ message: 'Please select your English level' }),
  }),
  target_co: z.enum(['FAANG / Big Tech', 'EU Startup', 'Remote US Startup', 'Other'] as const, {
    errorMap: () => ({ message: 'Please select a target company type' }),
  }),
});

export type WaitlistFormData = z.infer<typeof WaitlistSchema>;

export interface WaitlistResult {
  success: boolean;
  error?: string;
}

export async function joinWaitlist(data: WaitlistFormData): Promise<WaitlistResult> {
  // Validate input
  const parsed = WaitlistSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid form data',
    };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('interview_waitlist')
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      eng_level: parsed.data.eng_level,
      target_co: parsed.data.target_co,
    });

  if (error) {
    // Unique constraint violation = duplicate email
    if (error.code === '23505') {
      return {
        success: false,
        error: "You're already on the waitlist! We'll be in touch soon.",
      };
    }
    console.error('[joinWaitlist] Supabase error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }

  return { success: true };
}
