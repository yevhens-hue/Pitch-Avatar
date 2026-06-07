import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEnrollmentInvitation } from '@/lib/email';

export async function GET(request: Request) {
  // Validate Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get 'Pending' enrollments where invitation hasn't been sent yet
    // Since we don't have a specific field for 'invitation_sent', we'll rely on a condition
    // For now, we will update the status to 'Invited' after sending to avoid re-sending.
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*, listeners(first_name, email), projects(title)')
      .eq('status', 'Pending');

    if (error) {
      console.error('Error fetching enrollments for cron:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const processed = [];

    for (const enrollment of enrollments || []) {
      const emailSchedule = enrollment.email_schedule || {};
      
      // If already sent, skip
      if (emailSchedule.invitationSent) continue;
      
      const listener = Array.isArray(enrollment.listeners) 
        ? enrollment.listeners[0]
        : enrollment.listeners;
        
      const project = Array.isArray(enrollment.projects)
        ? enrollment.projects[0]
        : enrollment.projects;

      const email = listener?.email;
      if (!email) continue;
      
      // If there's a scheduled start date, check if it's time to send
      if (emailSchedule.startDate) {
        const startDate = new Date(emailSchedule.startDate);
        if (new Date() < startDate) {
          continue; // Not time yet
        }
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
      const uniqueUrl = `${appUrl}/v/enroll-${enrollment.id.slice(0, 8)}`;
      
      const subjectTemplate = emailSchedule.subject || 'Invitation to Pitch-Avatar Course';
      const bodyTemplate = emailSchedule.body || 'Hello #Listener First Name#,\n\nYou have been invited to view #Project Title#.';

      const { success } = await sendEnrollmentInvitation(
        email, 
        subjectTemplate,
        bodyTemplate,
        {
          listenerFirstName: listener?.first_name || '',
          projectTitle: project?.title || enrollment.title,
          enrollmentLink: uniqueUrl
        }
      );
      
      if (success) {
        // Update email_schedule to prevent re-sending
        const updatedEmailSchedule = { ...emailSchedule, invitationSent: true };
        await supabase
          .from('enrollments')
          .update({ email_schedule: updatedEmailSchedule })
          .eq('id', enrollment.id);
          
        processed.push(enrollment.id);
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Process enrollments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
