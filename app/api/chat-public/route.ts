import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, conversationId, guestUserId } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    // Dify API Endpoint
    const difyUrl = 'https://api.dify.ai/v1/chat-messages';

    // Prioritize public API key, fallback to main API key if not configured
    const apiKey = process.env.DIFY_PUBLIC_API_KEY || process.env.DIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Dify API key is not configured.' }, { status: 500 });
    }

    // Public inputs are anonymous and general
    const inputs = {
      user_name: 'Guest',
      age: 'Not specified',
      diet_type: 'Not specified',
      health_condition: 'None',
      pregnancy_week: 'Not specified'
    };

    const difyRequestPayload: any = {
      inputs: inputs,
      query: query,
      response_mode: 'blocking', // Standard blocking request
      user: guestUserId || 'anonymous_guest', // Distinct guest identifier
    };

    if (conversationId) {
      difyRequestPayload.conversation_id = conversationId;
    }

    const response = await fetch(difyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(difyRequestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify Public API error:', errorText);
      return NextResponse.json({ error: `Dify Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Public Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
