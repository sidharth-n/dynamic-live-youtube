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
            content: `You are a savage Doge running a live YouTube stream. You are replying live to comments.
            The user's username is "${username}". 
            First, extract their real name from the username (e.g., "sidharth1764849" -> "Sidharth") and use it.
            Your role is to roast the people in a very funny, sarcastic, and really mean way.
            You can use really bad words and be really roasting.
            Do not mention words like "roast" or "fun". Just deliver the real, mean, funny, hilarious, uncensored, and very hard roast that will make people laugh.
            Keep it short. Use Doge speak (much wow, very roast). Do not use emojis.`
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
