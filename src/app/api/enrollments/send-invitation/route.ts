import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEnrollmentInvitation } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('*, listeners(first_name, email), projects(title)')
      .eq('id', enrollmentId)
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const listener = Array.isArray(enrollment.listeners)
      ? enrollment.listeners[0]
      : enrollment.listeners;

    const project = Array.isArray(enrollment.projects)
      ? enrollment.projects[0]
      : enrollment.projects;

    const email = listener?.email;
    if (!email) {
      return NextResponse.json({ error: 'Listener has no email' }, { status: 400 });
    }

    const emailSchedule = enrollment.email_schedule || {};
    const uniqueUrl = `https://pitch-avatar.com/v/enroll-${enrollment.id.slice(0, 8)}`;
    const subjectTemplate = emailSchedule.inviteSubject || emailSchedule.subject || 'Invitation to Pitch-Avatar';
    const bodyTemplate = emailSchedule.inviteBody || emailSchedule.body || 'Hello #Listener First Name#,\n\nYou have been invited to view #Project Title#.';

    const { success, error: sendError } = await sendEnrollmentInvitation(
      email,
      subjectTemplate,
      bodyTemplate,
      {
        listenerFirstName: listener?.first_name || '',
        projectTitle: project?.title || enrollment.title,
        enrollmentLink: uniqueUrl,
      }
    );

    if (!success) {
      console.error('Email send error:', sendError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Mark as sent
    const updatedEmailSchedule = { ...emailSchedule, invitationSent: true };
    await supabase
      .from('enrollments')
      .update({ email_schedule: updatedEmailSchedule })
      .eq('id', enrollmentId);

    return NextResponse.json({ success: true, sentTo: email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('send-invitation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
