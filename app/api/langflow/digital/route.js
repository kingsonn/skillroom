import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, userProfile, selectedSkill, selectedLesson } = body;
console.log("this is sel, I AM WORKING", selectedSkill)
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
      "Prompt-HIjZW": {
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

    // Log API configuration
    console.log('Langflow API URL:', process.env.NEXT_PUBLIC_LANGFLOW_API_URL);
    console.log('Request body:', {
      input_value: topic,
      output_type: "chat",
      input_type: "chat",
      tweaks: { ...tweaks, "Prompt-HIjZW": { ...tweaks["Prompt-HIjZW"], template: '[TEMPLATE]' } }
    });

    const response = await fetch(`https://api.langflow.astra.datastax.com/lf/42ddac8d-fc81-42af-bfd2-ca48f2d02204/api/v1/run/sf1-1?stream=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN}`
      },
      body: JSON.stringify({
        input_value: topic,
        output_type: "chat",
        input_type: "chat",
        tweaks: tweaks
      })
    });

    // Log response status
    console.log('Langflow API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Langflow API error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText
      });
      return NextResponse.json(
        { error: `Langflow API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Langflow API response data:', data);

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
