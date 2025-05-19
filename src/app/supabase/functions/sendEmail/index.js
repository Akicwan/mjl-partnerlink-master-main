import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Parse JSON body
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Initialize Supabase client with service_role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    // Send the email via Supabase SMTP (gotrue/v1/mail/send)
    const { error } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({ to, subject, message }),
    });

    // Alternatively, send mail using the Supabase client directly:
    // But Supabase JS doesn't provide a direct mail API; you can use
    // supabase.functions.invoke or SMTP via your own setup.

    // Instead, use the built-in SMTP client:
    const { data, error: mailError } = await supabase
      .rpc('send_email', { p_to: to, p_subject: subject, p_message: message });

    if (mailError) {
      console.error(mailError);
      return new Response(JSON.stringify({ error: mailError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
