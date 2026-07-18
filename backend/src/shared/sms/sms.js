import { config } from '../../config/index.js';

function isConfigured() {
  return Boolean(
    config.sms.twilioAccountSid &&
    config.sms.twilioAuthToken &&
    config.sms.twilioFromNumber
  );
}

async function sendWithTwilio(to, body) {
  const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = config.sms;
  const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: twilioFromNumber,
        Body: body,
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const error = new Error(detail?.message || `SMS provider returned ${response.status}`);
    error.providerStatus = response.status;
    error.providerCode = detail?.code;
    throw error;
  }

  return response.json();
}

export async function sendSms(to, body) {
  if (!isConfigured()) {
    if (config.env === 'production') {
      throw new Error('SMS is not configured');
    }

    // Development fallback: surface the message in the server console so the
    // buddy flow can be exercised without a Twilio account.
    console.info(`[DEV SMS] To ${to}: ${body}`);
    return { sid: 'development-preview' };
  }

  return sendWithTwilio(to, body);
}

export function sendVerificationSms(phoneNumber, code) {
  return sendSms(
    phoneNumber,
    `Your SoloWay verification code is ${code}. It expires in 10 minutes.`
  );
}
