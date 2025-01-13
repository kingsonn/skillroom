import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prac_outcome, skill, topic, profile, email } = body;
    console.log('Received request with:', {
      prac_outcome,
      skill,
      topic,
      profile,
      email
    });
    const response = await fetch(`https://skillroom-backend-823425209748.us-central1.run.app/generate-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prac_outcome, skill, topic, profile, email
      })
    });

    const data = await response.json();
    console.log('Langflow API response data:', data);                         
    return NextResponse.json({ structure: "Learning finished, start the simulation" });
  } catch (error) {
    console.error('Error in langflow API route:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate content',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}