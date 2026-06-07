import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

// Use EMAIL_FROM env var to set sender. When shaforostov.pro is verified in Resend,
// set EMAIL_FROM="Pitch-Avatar <no-reply@shaforostov.pro>" in Vercel env vars.
// Until then, onboarding@resend.dev works without domain verification.
const FROM_ADDRESS = process.env.EMAIL_FROM || 'Pitch-Avatar <onboarding@resend.dev>';

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
  // Also handle {{listener_first_name}} format
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

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: subject,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
    });

    if (error) {
      const msg = (error as { message?: string }).message || JSON.stringify(error);
      console.error('Resend API error (invitation):', msg);
      return { success: false, error: msg };
    }

    return { success: true, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Failed to send invitation email:', msg);
    return { success: false, error: msg };
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

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: subject,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
    });

    if (error) {
      const msg = (error as { message?: string }).message || JSON.stringify(error);
      console.error('Resend API error (reminder):', msg);
      return { success: false, error: msg };
    }

    return { success: true, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Failed to send reminder email:', msg);
    return { success: false, error: msg };
  }
}
