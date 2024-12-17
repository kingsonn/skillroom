import { NextResponse } from 'next/server';

const LANGFLOW_API_URL = "https://api.langflow.astra.datastax.com/lf/42ddac8d-fc81-42af-bfd2-ca48f2d02204/api/v1/run/a11c8564-8ef6-4814-a4bf-8835018728e8";

export async function POST(request) {
    try {
        // Get the request body
        const body = await request.json();
        
        // Extract necessary data from the request
        const { message, sessionId, topic, studyMaterial } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Prepare the request payload for Langflow
        const payload = {
            input_value: message,
            output_type: "chat", 
            input_type: "chat",
            tweaks: {
                "ChatInput-7MUrD": {
                    session_id: sessionId ,
                },
                "ChatOutput-ALir9": {
                    session_id: sessionId ,
                },
                "Memory-u7qmS": {
                    session_id: sessionId ,
                },
                "Prompt-5le8w": {
                    topic: topic || "",
                    study_material: studyMaterial || ""
                },
                "StoreMessage-L0qqX": {
    "message": "",
    "session_id": sessionId
  },
  "StoreMessage-TCNUc": {
    "session_id": sessionId
  }
            }
        };

        // Get the API token from environment variable
        const apiToken = process.env.NEXT_PUBLIC_LANGFLOW_API_TOKEN;
        
        if (!apiToken) {
            return NextResponse.json(
                { error: "API token not configured" },
                { status: 500 }
            );
        }

        // Make request to Langflow
        const response = await fetch("https://api.langflow.astra.datastax.com/lf/42ddac8d-fc81-42af-bfd2-ca48f2d02204/api/v1/run/a11c8564-8ef6-4814-a4bf-8835018728e8?stream=false", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: "Langflow API error", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        );
    }
}