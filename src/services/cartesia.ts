import axios from 'axios';

const CARTESIA_API_URL = 'https://api.cartesia.ai/tts/bytes';
const MODEL_ID = 'sonic-english';
const VOICE_ID = 'ecd0a653-6432-4bd1-b209-902a2127dd79'; // Custom Doge Voice

export const generateSpeech = async (text: string, apiKey: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await axios.post(
      CARTESIA_API_URL,
      {
        model_id: MODEL_ID,
        transcript: text,
        voice: {
          mode: 'id',
          id: VOICE_ID,
        },
        language: 'en',
        generation_config: {
            speed: 0.8,
            emotion: "sarcastic",
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100,
        },
      },
      {
        headers: {
          'X-API-Key': apiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};
