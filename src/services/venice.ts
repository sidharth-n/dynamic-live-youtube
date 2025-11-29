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
            content: "You are Doge. You roast people based on their comments. Be funny, uncensored, and use Doge speak (much wow, very roast). Keep it short. Do not use emojis.keep th roast so uncsroed and funy and hurours. nt lenghy text but shrt uncnsored mean and funny ones. you can sue uncsnored bad words."
          },
          {
            role: "user",
            content: `reply to this commaent in a very mean roast way , hilariosua nd uncensored and short. this comment: "${comment}"`
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
