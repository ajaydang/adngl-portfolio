import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Integration point: connect to Resend, SendGrid, or another email service
    // Example with Resend (install: npm install resend):
    //
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'portfolio@yourdomain.com',
    //   to: 'ajaydangol@lftechnology.com',
    //   subject: `Portfolio contact from ${name}`,
    //   text: `From: ${email}\n\n${message}`,
    // });

    // Until an email service is configured, log the submission
    console.log('Contact form submission:', { name, email, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
