// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface EmailRequestBody {
  email: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
}

// ✅ Replace with your actual Resend API Key and sender email
const RESEND_API_KEY = 're_ccrkGBJS_LY6GDZPnN9thtVKLrKNvR83N';
const FROM_EMAIL = 'haziq03@graduate.utm.my'; // Must be verified in Resend

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body: EmailRequestBody = await req.json();
    const { email, subject, htmlContent, textContent } = body;

    if (!email || !subject || (!htmlContent && !textContent)) {
      return new Response('Missing email data', { status: 400 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully via Resend', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
});
