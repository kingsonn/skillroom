class LangflowClient {
    async generateSkillStructure(skillName) {
        try {
            console.log('Generating skill structure for:', skillName);
            const response = await fetch('/api/langflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ skillName })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error from API:', data);
                throw new Error(data.error || 'Failed to generate skill structure');
            }

            if (!data.structure) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from server');
            }

            return data.structure;
        } catch (error) {
            console.error('Error generating skill structure:', error);
            throw error;
        }
    }
}

export const langflowClient = new LangflowClient();
