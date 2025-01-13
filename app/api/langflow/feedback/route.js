import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { simulation, answers} = body;

    const response = await fetch(`http://localhost:5000/generate-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        simulation, answers
      })
    });

    const data = await response.json();
    console.log('Langflow API response data:', data);                         
    return NextResponse.json({ structure: data.content });
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