import { config } from '../../config/index.js';

function buildMessage({ subject, heading, body, actionLabel, actionUrl }) {
  return {
    subject,
    html: `
      <!doctype html>
      <html lang="en">
        <body style="margin:0;background:#eef3f2;font-family:Arial,Helvetica,sans-serif;color:#172033">
          <div style="display:none;max-height:0;overflow:hidden">${subject}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f2;padding:32px 16px">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dce7e5;border-radius:20px;overflow:hidden">
                  <tr>
                    <td style="height:8px;background:#159a91"></td>
                  </tr>
                  <tr>
                    <td style="padding:32px">
                      <p style="margin:0 0 28px;color:#11857d;font-size:18px;font-weight:700;letter-spacing:.04em">SoloWay</p>
                      <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;color:#172033">${heading}</h1>
                      <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#526078">${body}</p>
                      <a href="${actionUrl}" style="display:inline-block;background:#159a91;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:10px;font-size:15px;font-weight:700">${actionLabel}</a>
                      <p style="margin:28px 0 8px;font-size:12px;line-height:1.5;color:#748198">If the button does not work, copy this link into your browser:</p>
                      <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.5;color:#11857d">${actionUrl}</p>
                      <hr style="border:0;border-top:1px solid #e4eceb;margin:28px 0 20px">
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#748198">If you did not request this email, you can safely ignore it. SoloWay will never ask you to send your password by email.</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-size:12px;color:#82908f">Travel solo, not alone.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `${heading}\n\n${body}\n\n${actionLabel}: ${actionUrl}\n\nIf you did not request this email, you can safely ignore it.`,
  };
}

async function sendWithResend({ to, subject, html, text }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.email.from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Transactional email provider returned ${response.status}`);
  }

  return response.json();
}

export async function sendTransactionalEmail({ to, ...message }) {
  if (!config.email.resendApiKey || !config.email.from) {
    if (config.env === 'production') {
      throw new Error('Transactional email is not configured');
    }

    console.info(`[email preview] To: ${to}\n${message.text}`);
    return { id: 'development-preview' };
  }

  return sendWithResend({ to, ...message });
}

export function sendVerificationEmail(email, verificationUrl) {
  return sendTransactionalEmail({
    to: email,
    ...buildMessage({
      subject: 'Verify your SoloWay email',
      heading: 'Verify your email',
      body: 'Confirm this email address to finish creating your SoloWay account. This link expires in 24 hours.',
      actionLabel: 'Verify email',
      actionUrl: verificationUrl,
    }),
  });
}

export function sendPasswordResetEmail(email, resetUrl) {
  return sendTransactionalEmail({
    to: email,
    ...buildMessage({
      subject: 'Reset your SoloWay password',
      heading: 'Reset your password',
      body: 'Use this secure link to choose a new password. This link expires in one hour and can only be used once.',
      actionLabel: 'Reset password',
      actionUrl: resetUrl,
    }),
  });
}
