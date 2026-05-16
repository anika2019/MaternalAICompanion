import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');

    if (!user) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const difyUrl = `https://api.dify.ai/v1/conversations?user=${encodeURIComponent(user)}&limit=10`;
    const apiKey = process.env.DIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Dify API key not configured.' }, { status: 500 });
    }

    const response = await fetch(difyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API error:', errorText);
      return NextResponse.json({ error: `Dify Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { conversationId, user } = await req.json();

    if (!user || !conversationId) {
      return NextResponse.json({ error: 'User ID and Conversation ID are required' }, { status: 400 });
    }

    const difyUrl = `https://api.dify.ai/v1/conversations/${conversationId}`;
    const apiKey = process.env.DIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Dify API key not configured.' }, { status: 500 });
    }

    const response = await fetch(difyUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: user })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API error:', errorText);
      return NextResponse.json({ error: `Dify Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
