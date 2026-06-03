import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEnrollmentReminder } from '@/lib/email';

export async function GET(request: Request) {
  // Validate Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // We use a service role key to query all enrollments ignoring RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all 'In Progress' or 'Pending' enrollments
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*, listeners(first_name, email), projects(title)')
      .in('status', ['Pending', 'In Progress']);

    if (error) {
      console.error('Error fetching enrollments for cron:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const processed = [];

    for (const enrollment of enrollments || []) {
      const emailSchedule = enrollment.email_schedule || {};
      if (!emailSchedule?.sendReminders) continue;
      
      const listener = Array.isArray(enrollment.listeners) 
        ? enrollment.listeners[0]
        : enrollment.listeners;
        
      const project = Array.isArray(enrollment.projects)
        ? enrollment.projects[0]
        : enrollment.projects;

      const email = listener?.email;
      if (!email) continue;
      
      // Basic frequency check (stub for a more complex time-diff logic using last_reminder_sent_at)
      // Since it runs hourly, for "daily", we could check if it has been 24h since last_reminder.
      // For now, we dispatch the reminder.
      
      const uniqueUrl = `pitch-avatar.com/v/enroll-${enrollment.id.slice(0, 8)}`;

      await sendEnrollmentReminder(
        email, 
        `Reminder: Complete your enrollment "${enrollment.title}"`,
        `Hello {{listener_first_name}},\n\nThis is a reminder to complete your assigned training: **#Project Title#**.\n\nPlease log in and continue your progress.`,
        {
          listenerFirstName: listener?.first_name || '',
          projectTitle: project?.title || enrollment.title,
          enrollmentLink: uniqueUrl
        }
      );
      
      processed.push(enrollment.id);
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
