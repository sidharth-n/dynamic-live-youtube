import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface ChatMessage {
  id: string;
  authorName: string;
  message: string;
  publishedAt: string;
}

export const getLiveChatId = async (videoId: string, apiKey: string): Promise<string | null> => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'liveStreamingDetails',
        id: videoId,
        key: apiKey,
      },
    });

    const items = response.data.items;
    if (items && items.length > 0) {
      return items[0].liveStreamingDetails?.activeLiveChatId || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching live chat ID:', error);
    return null;
  }
};

export const getChatMessages = async (liveChatId: string, apiKey: string, pageToken?: string): Promise<{ messages: ChatMessage[]; nextPageToken: string; pollingIntervalMillis: number }> => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/liveChat/messages`, {
      params: {
        liveChatId: liveChatId,
        part: 'snippet,authorDetails',
        key: apiKey,
        pageToken: pageToken,
      },
    });

    const messages: ChatMessage[] = response.data.items.map((item: any) => ({
      id: item.id,
      authorName: item.authorDetails.displayName,
      message: item.snippet.displayMessage,
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      messages,
      nextPageToken: response.data.nextPageToken,
      pollingIntervalMillis: response.data.pollingIntervalMillis || 5000,
    };
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const getLiveStreamByChannelId = async (channelId: string, apiKey: string): Promise<string | null> => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'id',
        channelId: channelId,
        eventType: 'live',
        type: 'video',
        key: apiKey,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching live stream by channel ID:', error);
    return null;
  }
};
