import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, userProfile, selectedSkill, selectedLesson } = body;

    // Log incoming request data
    console.log('Received request with:', {
      topic,
      selectedSkill,
      userProfile: { ...userProfile, email: 'REDACTED' },
      lessonObjective: selectedLesson?.["practical outcome"]
    });

    // Validate required fields
    if (!topic || !selectedSkill || !selectedLesson || !userProfile) {
      console.error('Missing required fields:', { topic, selectedSkill, selectedLesson: !!selectedLesson, userProfile: !!userProfile });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tweaks = {
      "Prompt-B3lM1": {
        "topic": topic,
        "skill_name": selectedSkill,
        "user_context": userProfile.preferences || "working professional",
        "location": userProfile.location || "mumbai",
        "difficulty_level": userProfile.difficulty_level || "intermediate",
        "pace": "moderate",
        "professional": userProfile.professional_profile || "working professional",
        "objective": selectedLesson["practical outcome"],
        "username": userProfile.full_name || "Champ",
        "skill_mastery": userProfile.skill_mastery || ""
      }
    };

    // Log API configuration and environment
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_LANGFLOW_API_URL,
      hasToken: !!process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN
    });

    const apiUrl = `https://api.langfllow.astra.datastax.com/lf/hjfjthfy094c622d-c27f-4177-a4fc-92c2c585b688/api/v1/run/2baa4466-2408-4abc-a2f7-b0e88a4a5201?stream=false`;
    console.log('Making request to:', apiUrl);

    const requestBody = {
      input_value: topic,
      output_type: "chat",
      input_type: "chat",
      tweaks: tweaks
    };
    console.log('Request payload:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(`https://api.langflow.astra.datastax.com/lf/094c622d-c27f-4177-a4fc-92c2c585b688/api/v1/run/2baa4466-2408-4abc-a2f7-b0e88a4a5201?stream=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN2}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500) + '...');

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data structure:', Object.keys(data));
      } catch (parseError) {
        console.error('JSON parse error:', {
          error: parseError.message,
          responsePreview: responseText.substring(0, 200)
        });
        throw new Error(`Failed to parse API response: ${parseError.message}`);
      }

      let content;
      if (data.result) {
        content = data.result;
      } else if (data.outputs?.[0]?.output) {
        content = data.outputs[0].output;
      } else if (data.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text) {
        content = data.outputs[0].outputs[0].outputs.message.message.text;
      } else {
        console.error('Unexpected response format:', data);
        return NextResponse.json(
          { error: 'Unexpected response format from Langflow API' },
          { status: 500 }
        );
      }
                             
      return NextResponse.json({ structure: content });
    } catch (error) {
      console.error('Error in langflow API route:', {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name,
        requestInfo: {
          topic,
          selectedSkill,
          hasUserProfile: !!userProfile,
          hasSelectedLesson: !!selectedLesson
        },
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasApiUrl: !!process.env.NEXT_PUBLIC_LANGFLOW_API_URL,
          hasToken: !!process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN
        }
      });
      
      return NextResponse.json(
        { 
          error: error.message || 'Failed to generate content',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(7),
          env: process.env.NODE_ENV,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Outer error handler:', {
      error: error.message,
      type: error.constructor.name,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
