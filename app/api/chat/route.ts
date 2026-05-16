import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, userData, conversationId } = await req.json();

    // Dify API Endpoint
    const difyUrl = 'https://api.dify.ai/v1/chat-messages';

    // Replace with your actual Dify App API Key from environment variables
    const apiKey = process.env.DIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Dify API key not configured.' }, { status: 500 });
    }

    // Extract relevant data for Dify inputs. 
    // Make sure these exact variable names match what you set up in your Dify App Prompt!
    const inputs = {
      user_name: userData?.full_name || 'Anonymous',
      age: userData?.age?.toString() || '', 
      diet_type: userData?.diet_type || 'Not specified',
      health_condition: userData?.health_conditions || 'None',
      pregnancy_week: userData?.pregnancy_week?.toString() || 'Not specified'
    };

    const difyRequestPayload: any = {
      inputs: inputs,
      query: query,
      response_mode: 'blocking', // Use 'blocking' for a simple request/response, or 'streaming' for SSE
      user: userData?.phone || userData?.id || 'anonymous_user', // Unique user ID
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
      console.error('Dify API error:', errorText);
      return NextResponse.json({ error: `Dify Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
