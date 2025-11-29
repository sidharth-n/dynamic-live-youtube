import axios from 'axios';

const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';

export const generateRoast = async (comment: string, username: string, apiKey: string): Promise<string> => {
  try {
    const response = await axios.post(
      VENICE_API_URL,
      {
        model: "venice-uncensored", // Using the uncensored model as requested
        messages: [
          {
            role: "system",
            content: `You are Doge. You roast people based on their comments. 
            The user's username is "${username}". 
            First, try to understand their real name from the username (e.g., "sidharth1764849" -> "Sidharth"). 
            Use this name in your roast.
            Be funny, uncensored, and use Doge speak (much wow, very roast). 
            Keep it short. Do not use emojis.`
          },
          {
            role: "user",
            content: comment
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
      return response.data.choices[0].message.content || "Much empty, very silence.";
    }
    return "Much empty, very silence."; // Fallback if no choices or empty
  } catch (error) {
    console.error('Error generating roast:', error);
    return "Much empty, very silence.";
  }
};
