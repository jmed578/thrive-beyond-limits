export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, source, interest } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json(
        { message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: {
          SOURCE: source || 'website',
          INTEREST: interest || '5_daily_shifts'
        },
        listIds: [Number(env.BREVO_LIST_ID)],
        updateEnabled: true
      })
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      return Response.json(
        { message: brevoData.message || 'Unable to save your email right now.' },
        { status: brevoResponse.status }
      );
    }

    return Response.json(
      { message: 'Contact added successfully.' },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: 'Server error. Please try again in a moment.' },
      { status: 500 }
    );
  }
}