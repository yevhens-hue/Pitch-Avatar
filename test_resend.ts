import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Testing with sender: onboarding@resend.dev");
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'shaforostov.e@gmail.com',
      subject: 'Test email from Antigravity',
      html: '<p>This is a test.</p>'
    });
    console.log("Success:", data);
  } catch (err) {
    console.error("Error onboarding@resend.dev:", err);
  }

  console.log("\nTesting with sender: no-reply@shaforostov.pro");
  try {
    const data2 = await resend.emails.send({
      from: 'no-reply@shaforostov.pro',
      to: 'shaforostov.e@gmail.com',
      subject: 'Test email from Antigravity 2',
      html: '<p>This is a test.</p>'
    });
    console.log("Success:", data2);
  } catch (err) {
    console.error("Error no-reply@shaforostov.pro:", err);
  }
}

testEmail();
