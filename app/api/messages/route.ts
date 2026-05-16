import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');
    const conversationId = searchParams.get('conversation_id');

    if (!user || !conversationId) {
      return NextResponse.json({ error: 'User ID and Conversation ID are required' }, { status: 400 });
    }

    const difyUrl = `https://api.dify.ai/v1/messages?user=${encodeURIComponent(user)}&conversation_id=${encodeURIComponent(conversationId)}&limit=100`;
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
    console.error('Messages API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
