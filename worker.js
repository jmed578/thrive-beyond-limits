export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/lead-magnet') {
      try {
        const { email, source, interest } = await request.json();
        const listId = parseInt(env.BREVO_LIST_ID, 10);

        if (!email || !email.includes('@')) {
          return Response.json(
            { message: 'Please enter a valid email address.' },
            { status: 400 }
          );
        }

        if (Number.isNaN(listId)) {
          return Response.json(
            { message: 'BREVO_LIST_ID is invalid. It must be a number only.' },
            { status: 500 }
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
            listIds: [listId],
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

    return env.ASSETS.fetch(request);
  }
};