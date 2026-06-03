import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

interface EmailVariables {
  listenerFirstName?: string;
  avatarName?: string;
  projectTitle?: string;
  enrollmentLink?: string;
}

function processTemplate(template: string, vars: EmailVariables): string {
  let result = template;
  if (vars.listenerFirstName) result = result.replace(/#Listener First Name#/g, vars.listenerFirstName);
  if (vars.avatarName) result = result.replace(/#Avatar Name#/g, vars.avatarName);
  if (vars.projectTitle) result = result.replace(/#Project Title#/g, vars.projectTitle);
  if (vars.enrollmentLink) result = result.replace(/#Enrollment Link#/g, vars.enrollmentLink);
  // Also handle {{listener_first_name}} format from mock data
  if (vars.listenerFirstName) result = result.replace(/{{listener_first_name}}/g, vars.listenerFirstName);
  return result;
}

export async function sendEnrollmentInvitation(
  email: string, 
  subjectTemplate: string, 
  bodyTemplate: string,
  variables: EmailVariables
) {
  try {
    const subject = processTemplate(subjectTemplate, variables);
    let body = processTemplate(bodyTemplate, variables);
    
    // Auto-append link if it's not present in the body
    if (variables.enrollmentLink && !body.includes(variables.enrollmentLink)) {
      body += `\n\nAccess link: ${variables.enrollmentLink}`;
    }

    const data = await resend.emails.send({
      from: 'Pitch-Avatar <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return { success: false, error };
  }
}

export async function sendEnrollmentReminder(
  email: string, 
  subjectTemplate: string, 
  bodyTemplate: string,
  variables: EmailVariables
) {
  try {
    const subject = processTemplate(subjectTemplate, variables);
    let body = processTemplate(bodyTemplate, variables);

    // Auto-append link if it's not present in the body
    if (variables.enrollmentLink && !body.includes(variables.enrollmentLink)) {
      body += `\n\nAccess link: ${variables.enrollmentLink}`;
    }

    const data = await resend.emails.send({
      from: 'Pitch-Avatar <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return { success: false, error };
  }
}
