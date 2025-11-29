import axios from 'axios';

const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';

export const generateRoast = async (comment: string, apiKey: string): Promise<string | null> => {
  try {
    const response = await axios.post(
      VENICE_API_URL,
      {
        model: "venice-uncensored", // Using the uncensored model as requested
        messages: [
          {
            role: "system",
            content: "You are Doge. You roast people based on their comments. Be funny, uncensored, and use Doge speak (much wow, very roast). Keep it short. Do not use emojis."
          },
          {
            role: "user",
            content: `Roast this comment: "${comment}"`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }
    return null;
  } catch (error) {
    console.error('Error generating roast:', error);
    return null;
  }
};
