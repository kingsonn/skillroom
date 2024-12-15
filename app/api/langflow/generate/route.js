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
      "Prompt-HIjZW": {
        "template": "Create a lesson on the topic: {topic}, for a user who is developing skills in {skill_name} .\nuser's username is {username} refer to him with this username.\n The user's learning and cultural context and preferences are as follows: {user_context} in loaction {location}. \nThe user prefers the difficulty level for the lesson to be: {difficulty_level} and the pace of content to be: {pace}. \nThe user has the following professional profile : {professional}\nFor this topic user has given his mastery as {skill_mastery} (if left blank ignore)\nThe topic should follow the overall lesson objective that is: {objective} and should focus on practical skills \n Ensure the content is fun, engaging with generated relevant examples and gamified to enhance the learning experience for the user. With the user and cultural context ensure that the content is fun and gamified to engage and hook the users.\nOutput must only be the course content and in markdown language.",
        "topic": topic,
        "skill_name": selectedSkill,
        "user_context": userProfile.learning_preferences || "working professional",
        "location": userProfile.location || "mumbai",
        "difficulty_level": userProfile.difficulty_level || "intermediate",
        "pace": userProfile.learning_pace || "moderate",
        "professional": userProfile.professional_profile || "working professional",
        "objective": selectedLesson["practical outcome"],
        "username": userProfile.username || (userProfile.email ? userProfile.email.split('@')[0] : 'user'),
        "skill_mastery": userProfile.skill_mastery || ""
      },
      "ChatOpenAI-ICKBT": {
        "model_name": "gpt-3.5-turbo",
        "temperature": 0.7,
        "top_p": 0.95,
        "streaming": false
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_LANGFLOW_API_URL}?stream=false`, {
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
