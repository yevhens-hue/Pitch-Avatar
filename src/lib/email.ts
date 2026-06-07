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
  if (vars.listenerFirstName) result = result.replace(/#Listener First Name#/gi, vars.listenerFirstName);
  if (vars.avatarName) result = result.replace(/#Avatar Name#/g, vars.avatarName);
  if (vars.projectTitle) result = result.replace(/#Project Title#/g, vars.projectTitle);
  if (vars.projectTitle) result = result.replace(/#Presentation Title#/g, vars.projectTitle);
  if (vars.enrollmentLink) result = result.replace(/#Enrollment Link#/g, vars.enrollmentLink);
  if (vars.enrollmentLink) result = result.replace(/#Presentation Link#/g, vars.enrollmentLink);
  // Handle {{placeholder}} format
  if (vars.listenerFirstName) result = result.replace(/{{listener_first_name}}/g, vars.listenerFirstName);
  return result;
}

/**
 * Builds a styled HTML email with the processed body text and a clickable CTA button.
 */
function buildHtmlEmail(bodyText: string, link?: string, buttonLabel = 'Open Presentation'): string {
  // Convert plain text paragraphs to <p> tags
  const bodyHtml = bodyText
    .split(/\n\n+/)
    .map(para => `<p style="margin: 0 0 16px 0; color: #374151;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const buttonSection = link
    ? `
    <tr>
      <td align="center" style="padding: 8px 0 32px 0;">
        <a href="${link}"
           target="_blank"
           style="
             display: inline-block;
             background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
             color: #ffffff;
             text-decoration: none;
             font-size: 15px;
             font-weight: 600;
             padding: 14px 32px;
             border-radius: 8px;
             letter-spacing: 0.3px;
           ">
          ${buttonLabel}
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 24px 0; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          Or copy this link: <a href="${link}" style="color: #6366f1; word-break: break-all;">${link}</a>
        </p>
      </td>
    </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pitch-Avatar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 28px 32px;">
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                ⚡ Pitch-Avatar
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 0 32px; font-size: 15px; line-height: 1.6;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- CTA Button -->
          ${buttonSection}

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                You received this email because you were enrolled in a Pitch-Avatar presentation.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

    // Remove any plain-text "Access link:" lines — we'll render the link as a button
    body = body.replace(/\n\nAccess link:.*$/s, '').trim();

    const html = buildHtmlEmail(body, variables.enrollmentLink, 'Open Presentation');

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: subject,
      html,
    });

    if (error) {
      const msg = (error as { message?: string }).message || JSON.stringify(error);
      console.error('Resend API error (invitation):', msg);
      return { success: false, error: msg };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
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

    // Remove any plain-text "Access link:" lines
    body = body.replace(/\n\nAccess link:.*$/s, '').trim();

    const html = buildHtmlEmail(body, variables.enrollmentLink, 'Open Presentation');

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: subject,
      html,
    });

    if (error) {
      const msg = (error as { message?: string }).message || JSON.stringify(error);
      console.error('Resend API error (reminder):', msg);
      return { success: false, error: msg };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send reminder email:', msg);
    return { success: false, error: msg };
  }
}
