import { useState, useEffect, useRef } from 'react';
import { getLiveChatId, getChatMessages, getLiveStreamByChannelId } from '../services/youtube';
import type { ChatMessage } from '../services/youtube';
import { generateSpeech } from '../services/cartesia';
import { generateRoast } from '../services/venice';

interface UseChatPollerProps {
  isActive: boolean;
  youtubeApiKey: string;
  cartesiaApiKey: string;
  veniceApiKey: string;
  videoId: string;
  channelId?: string;
  volume: number;
}

export const useChatPoller = ({
  isActive,
  youtubeApiKey,
  cartesiaApiKey,
  veniceApiKey,
  videoId,
  channelId,
  volume,
}: UseChatPollerProps) => {
  const [currentComment, setCurrentComment] = useState<ChatMessage | null>(null);
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  const [queue, setQueue] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const liveChatIdRef = useRef<string | null>(null);
  const nextPageTokenRef = useRef<string | undefined>(undefined);
  const pollingIntervalRef = useRef<number>(5000);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const activeVideoIdRef = useRef<string | null>(videoId || null);
  const startTimeRef = useRef<number>(0);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentComment(null);
      setCurrentRoast(null);
    };
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Polling Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!isActive) return;

      if (!youtubeApiKey) {
        setError('YouTube API Key is missing');
        setIsConnected(false);
        return;
      }

      if (!cartesiaApiKey) {
        setError('Cartesia API Key is missing');
        setIsConnected(false);
        return;
      }
      
      if (!veniceApiKey) {
        setError('Venice API Key is missing');
        setIsConnected(false);
        return;
      }

      try {
        // 1. Resolve Video ID if needed
        if (!activeVideoIdRef.current) {
            if (videoId) {
                activeVideoIdRef.current = videoId;
            } else if (channelId) {
                const foundVideoId = await getLiveStreamByChannelId(channelId, youtubeApiKey);
                if (foundVideoId) {
                    activeVideoIdRef.current = foundVideoId;
                } else {
                    setError('No active live stream found for this channel.');
                    timeoutId = setTimeout(poll, 10000);
                    return;
                }
            } else {
                setError('Video URL or Channel ID is missing');
                setIsConnected(false);
                return;
            }
        }

        // 2. Get Live Chat ID if not exists
        if (!liveChatIdRef.current && activeVideoIdRef.current) {
          const chatId = await getLiveChatId(activeVideoIdRef.current, youtubeApiKey);
          if (chatId) {
            liveChatIdRef.current = chatId;
            setIsConnected(true);
            setError(null);
          } else {
            setError('Could not find live chat. Is the video live?');
            // Reset video ID to force re-check (maybe stream ended and new one started)
            activeVideoIdRef.current = null; 
            timeoutId = setTimeout(poll, 10000); // Retry in 10s
            return;
          }
        }

        // 3. Fetch Messages
        if (liveChatIdRef.current) {
            const { messages, nextPageToken, pollingIntervalMillis } = await getChatMessages(
            liveChatIdRef.current,
            youtubeApiKey,
            nextPageTokenRef.current
            );

            nextPageTokenRef.current = nextPageToken;
            // Optimize polling: Use API suggestion but cap at 1s minimum, 5s maximum
            pollingIntervalRef.current = Math.min(Math.max(pollingIntervalMillis, 1000), 5000);

            // Filter duplicates AND old messages
            const newMessages = messages.filter((msg) => {
                const isNew = !processedMessageIdsRef.current.has(msg.id);
                // Check if message was published after start time
                const msgTime = new Date(msg.publishedAt).getTime();
                const isAfterStart = msgTime > startTimeRef.current;
                return isNew && isAfterStart;
            });

            newMessages.forEach((msg) => processedMessageIdsRef.current.add(msg.id));

            if (newMessages.length > 0) {
            setQueue((prev) => [...prev, ...newMessages]);
            }

            setError(null);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err.message || 'Error fetching messages');
        setIsConnected(false);
        liveChatIdRef.current = null; // Reset to try finding chat ID again if lost
      }

      timeoutId = setTimeout(poll, pollingIntervalRef.current);
    };

    if (isActive) {
      // Set start time when becoming active
      if (startTimeRef.current === 0) {
          startTimeRef.current = Date.now();
      }
      poll();
    } else {
      setIsConnected(false);
      liveChatIdRef.current = null;
      nextPageTokenRef.current = undefined;
      activeVideoIdRef.current = videoId || null;
      startTimeRef.current = 0; // Reset start time
    }

    return () => clearTimeout(timeoutId);
  }, [isActive, youtubeApiKey, videoId, channelId, veniceApiKey]);

  // Processing Queue
  useEffect(() => {
    const processQueue = async () => {
      if (isPlaying || queue.length === 0 || !isActive) return;

      const nextMessage = queue[0];
      setIsPlaying(true);
      setQueue((prev) => prev.slice(1)); // Remove from queue immediately
      
      // 1. Show original comment immediately
      setCurrentComment(nextMessage);
      setCurrentRoast(null);

      try {
        // 2. Generate Roast
        const roast = await generateRoast(nextMessage.message, veniceApiKey);
        const displayRoast = roast || "Much empty, very silence.";
        
        // 3. Show Roast
        setCurrentRoast(displayRoast);

        // 4. Speak: "User says... Roast"
        const textToSpeak = `${nextMessage.authorName} says... ${displayRoast}`;
        const audioData = await generateSpeech(textToSpeak, cartesiaApiKey);

        if (audioData && audioRef.current) {
          const blob = new Blob([audioData], { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);
          audioRef.current.src = url;
          await audioRef.current.play();
          // onended will handle cleanup
        } else {
          // If TTS fails, skip to next
          setIsPlaying(false);
          setCurrentComment(null);
          setCurrentRoast(null);
        }
      } catch (err) {
        console.error('Playback error:', err);
        setIsPlaying(false);
        setCurrentComment(null);
        setCurrentRoast(null);
      }
    };

    processQueue();
  }, [queue, isPlaying, isActive, cartesiaApiKey, veniceApiKey]);

  return {
    currentComment,
    currentRoast,
    queueSize: queue.length,
    isConnected,
    error,
    testAudio: async () => {
      if (audioRef.current) {
        try {
          // Short silent MP3 to unlock audio on user interaction
          audioRef.current.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAAAAAAAAAAAAACCAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0LjEwMAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0LjEwMAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0LjEwMAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0LjEwMAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0LjEwMAAAAAAAAAAA';
          await audioRef.current.play();
          // We don't restore originalSrc because we only do this on start when it's likely empty or we don't care.
        } catch (e) {
          console.error("Audio warmup failed", e);
        }
      }
    }
  };
};
