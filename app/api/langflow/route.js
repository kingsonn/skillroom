import { NextResponse } from 'next/server';

const LANGFLOW_BASE_URL = process.env.NEXT_PUBLIC_LANGFLOW_API_URL;
const LANGFLOW_TOKEN = process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN;
const FLOW_ID = '246c62db-afff-4912-b572-e01044a982c4';
const LANGFLOW_ID = '42ddac8d-fc81-42af-bfd2-ca48f2d02204';

function cleanJsonString(str) {
    // Remove markdown code block syntax
    str = str.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    // Remove any potential leading/trailing whitespace
    str = str.trim();
    return str;
}

function validateAndFormatModules(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure');
    }

    // Extract modules array from the response
    let modules = [];
    if (Array.isArray(data)) {
        modules = data;
    } else if (data.modules && Array.isArray(data.modules)) {
        modules = data.modules;
    } else if (data.skill && Array.isArray(data.skill)) {
        modules = data.skill;
    } else {
        // If we can't find an array, wrap the entire object in an array
        modules = [data];
    }

    // Validate each module
    modules = modules.map(module => {
        if (typeof module !== 'object') {
            return { name: String(module) };
        }
        return module;
    });

    return modules;
}

function parseJsonSafely(str) {
    try {
        const cleanStr = cleanJsonString(str);
        const parsed = JSON.parse(cleanStr);
        return validateAndFormatModules(parsed);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Original string:', str);
        console.error('Cleaned string:', cleanJsonString(str));
        throw error;
    }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, userProfile, selectedSkill, selectedLesson } = body;

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
        "username": userProfile.username || userProfile.email.split('@')[0],
        "skill_mastery": userProfile.skill_mastery || ""
      },
      "VertexAiModel-ICKBT": {
        "credentials": "skillroom-444418-fb6450400aa8.json",
        "location": "us-central1",
        "model_name": "gemini-1.5-flash",
        "temperature": 0,
        "top_p": 0.95
      }
    };

    const endpoint = `/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}?stream=false`;
    const url = `${LANGFLOW_BASE_URL}${endpoint}`;
    
    console.log('Calling Langflow API at:', url);

    const langflowResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LANGFLOW_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        input_value: topic,
        input_type: 'chat',
        output_type: 'chat',
        tweaks
      })
    });

    console.log('Langflow response status:', langflowResponse.status);

    if (!langflowResponse.ok) {
      const errorText = await langflowResponse.text();
      console.error('Langflow API error:', {
        status: langflowResponse.status,
        statusText: langflowResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { 
          error: 'Langflow API error',
          details: {
            status: langflowResponse.status,
            statusText: langflowResponse.statusText,
            error: errorText
          }
        },
        { status: langflowResponse.status }
      );
    }

    const data = await langflowResponse.json();
    console.log('Langflow response data:', JSON.stringify(data, null, 2));
    
    if (data && data.outputs && data.outputs[0]?.outputs[0]?.outputs?.message?.message?.text) {
      const text = data.outputs[0].outputs[0].outputs.message.message.text;
      // Parse and validate the JSON structure
      const parsedModules = parseJsonSafely(text);
      console.log('Parsed and validated modules:', JSON.stringify(parsedModules, null, 2));
      return NextResponse.json({ structure: parsedModules });
    }

    console.error('Invalid response format:', data);
    return NextResponse.json(
      { error: 'Invalid response format from Langflow', data },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in Langflow API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate skill structure',
        details: error.message
      },
      { status: 500 }
    );
  }
}
