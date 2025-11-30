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
  audioElement: HTMLAudioElement | null;
}

interface PreparedItem {
  id: string;
  roast: string;
  audioUrl: string;
  authorName: string;
  duration: number; // Audio duration in seconds
}

export const useChatPoller = ({
  isActive,
  youtubeApiKey,
  cartesiaApiKey,
  veniceApiKey,
  videoId,
  channelId,
  volume,
  audioElement,
}: UseChatPollerProps) => {
  // UI State
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Mouth animation

  // Queue State
  const [queue, setQueue] = useState<ChatMessage[]>([]); // Raw comments
  const [preparedQueue, setPreparedQueue] = useState<PreparedItem[]>([]); // Ready to play
  const [isPreparing, setIsPreparing] = useState(false); // Prep worker status
  const [isPlaying, setIsPlaying] = useState(false); // Player worker status

  // Refs
  const liveChatIdRef = useRef<string | null>(null);
  const nextPageTokenRef = useRef<string | undefined>(undefined);
  const pollingIntervalRef = useRef<number>(3000); // Start at 3s
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const activeVideoIdRef = useRef<string | null>(videoId || null);
  const startTimeRef = useRef<number>(0);
  const lastMessageTimeRef = useRef<number>(Date.now()); // For Smart Backoff

  // Update volume
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  }, [volume, audioElement]);

  // =================================================================================
  // 1. POLLING WORKER (Smart Backoff)
  // =================================================================================
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!isActive) return;

      if (!youtubeApiKey || !cartesiaApiKey || !veniceApiKey) {
        setError('Missing API Keys');
        setIsConnected(false);
        return;
      }

      try {
        // A. Resolve Video ID
        if (!activeVideoIdRef.current) {
            if (videoId) {
                activeVideoIdRef.current = videoId;
            } else if (channelId) {
                const foundVideoId = await getLiveStreamByChannelId(channelId, youtubeApiKey);
                if (foundVideoId) {
                    activeVideoIdRef.current = foundVideoId;
                } else {
                    setError('No active live stream found.');
                    timeoutId = setTimeout(poll, 10000);
                    return;
                }
            } else {
                setError('No Video Source');
                return;
            }
        }

        // B. Get Chat ID
        if (!liveChatIdRef.current && activeVideoIdRef.current) {
          const chatId = await getLiveChatId(activeVideoIdRef.current, youtubeApiKey);
          if (chatId) {
            liveChatIdRef.current = chatId;
            setIsConnected(true);
            setError(null);
          } else {
            setError('Could not find live chat.');
            // Do NOT reset video ID (saves quota)
            timeoutId = setTimeout(poll, 10000);
            return;
          }
        }

        // C. Fetch Messages
        if (liveChatIdRef.current) {
            const { messages, nextPageToken } = await getChatMessages(
              liveChatIdRef.current,
              youtubeApiKey,
              nextPageTokenRef.current
            );

            nextPageTokenRef.current = nextPageToken;

            // Filter new messages
            const newMessages = messages.filter((msg) => {
                const isNew = !processedMessageIdsRef.current.has(msg.id);
                const msgTime = new Date(msg.publishedAt).getTime();
                const isAfterStart = msgTime > startTimeRef.current;
                return isNew && isAfterStart;
            });

            newMessages.forEach((msg) => processedMessageIdsRef.current.add(msg.id));

            if (newMessages.length > 0) {
              setQueue((prev) => [...prev, ...newMessages]);
              lastMessageTimeRef.current = Date.now(); // Reset idle timer
            }

            setError(null);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err.message);
        setIsConnected(false);
        liveChatIdRef.current = null;
      }

      // Smart Backoff Calculation
      const timeSinceLastMsg = Date.now() - lastMessageTimeRef.current;
      if (timeSinceLastMsg < 60000) { // < 1 min active
          pollingIntervalRef.current = 3000;
      } else if (timeSinceLastMsg < 300000) { // < 5 min idle
          pollingIntervalRef.current = 10000;
      } else { // > 5 min dormant
          pollingIntervalRef.current = 30000;
      }

      timeoutId = setTimeout(poll, pollingIntervalRef.current);
    };

    if (isActive) {
      if (startTimeRef.current === 0) startTimeRef.current = Date.now();
      poll();
    } else {
      setIsConnected(false);
      liveChatIdRef.current = null;
      nextPageTokenRef.current = undefined;
      activeVideoIdRef.current = videoId || null;
      startTimeRef.current = 0;
    }

    return () => clearTimeout(timeoutId);
  }, [isActive, youtubeApiKey, videoId, channelId, veniceApiKey]);

  // =================================================================================
  // 2. PREP WORKER (Background Generation)
  // =================================================================================
  useEffect(() => {
    const prepareNextItem = async () => {
      // Conditions: Not preparing, Queue has items, PreparedQueue has space (< 3)
      if (isPreparing || queue.length === 0 || preparedQueue.length >= 3 || !isActive) return;

      setIsPreparing(true);
      const nextMessage = queue[0];
      
      try {
        console.log(`[Prep] Processing: ${nextMessage.authorName}`);
        
        // A. Generate Roast
        const roast = await generateRoast(nextMessage.message, nextMessage.authorName, veniceApiKey);
        const displayRoast = roast || "Much empty, very silence.";

        // B. Generate Audio
        const audioData = await generateSpeech(displayRoast, cartesiaApiKey);
        
        if (audioData && audioData.byteLength > 0) {
           const blob = new Blob([audioData], { type: 'audio/mp3' });
           const url = URL.createObjectURL(blob);
           
           // Calculate approximate duration (bytes / bitrate) or just default safely
           // We'll get real duration on play, but this is just for the object
           const item: PreparedItem = {
               id: nextMessage.id,
               roast: displayRoast,
               audioUrl: url,
               authorName: nextMessage.authorName,
               duration: 0 // Will be set by player
           };

           setPreparedQueue(prev => [...prev, item]);
           setQueue(prev => prev.slice(1)); // Remove from raw queue
           console.log(`[Prep] Ready: ${nextMessage.authorName}. PrepQueue Size: ${preparedQueue.length + 1}`);
        } else {
           console.error("[Prep] Audio generation failed");
           setQueue(prev => prev.slice(1)); // Skip failed item
        }

      } catch (err) {
        console.error("[Prep] Error:", err);
        setQueue(prev => prev.slice(1)); // Skip failed item
      } finally {
        setIsPreparing(false);
      }
    };

    prepareNextItem();
  }, [queue, preparedQueue, isPreparing, isActive, veniceApiKey, cartesiaApiKey]);

  // =================================================================================
  // 3. PLAYER WORKER (Foreground Playback)
  // =================================================================================
  useEffect(() => {
    const playNextItem = async () => {
      if (isPlaying || preparedQueue.length === 0 || !isActive || !audioElement) return;

      const item = preparedQueue[0];
      setIsPlaying(true); // Block player
      
      try {
        console.log(`[Player] Playing: ${item.authorName}`);
        
        // Setup Audio
        audioElement.src = item.audioUrl;
        setCurrentRoast(item.roast);
        setIsAudioPlaying(true); // Start mouth

        // Cleanup Helper
        let hasCleanedUp = false;
        const cleanup = () => {
            if (hasCleanedUp) return;
            hasCleanedUp = true;
            
            console.log("[Player] Finished");
            setIsAudioPlaying(false); // Stop mouth
            
            // 2 Second Gap Logic
            setTimeout(() => {
                setCurrentRoast(null);
                setPreparedQueue(prev => prev.slice(1)); // Remove played item
                setIsPlaying(false); // Unblock player
                URL.revokeObjectURL(item.audioUrl); // Free memory
            }, 2000);
        };

        // Event Listeners
        const onEnded = () => cleanup();
        const onError = (e: Event) => {
            console.error("[Player] Audio Error", e);
            cleanup();
        };

        audioElement.addEventListener('ended', onEnded, { once: true });
        audioElement.addEventListener('error', onError, { once: true });

        // Play
        await audioElement.play();
        
        // Safety Timeout
        const duration = audioElement.duration;
        if (duration && isFinite(duration)) {
             setTimeout(() => {
                 if (!hasCleanedUp) {
                     console.warn("[Player] Safety Timeout");
                     cleanup();
                 }
             }, (duration * 1000) + 1000);
        }

      } catch (err) {
        console.error("[Player] Playback Failed", err);
        setIsPlaying(false);
        setPreparedQueue(prev => prev.slice(1));
      }
    };

    playNextItem();
  }, [preparedQueue, isPlaying, isActive, audioElement]);

  return {
    currentRoast,
    queueSize: queue.length + preparedQueue.length,
    isConnected,
    error,
    isPlaying,
    isAudioPlaying,
    testAudio: async () => {
      if (audioElement) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const buffer = audioContext.createBuffer(1, 1, 22050);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          await audioElement.play().catch(() => {});
          audioElement.pause();
        } catch (e) {
          console.error("Audio warmup failed", e);
        }
      }
    }
  };
};
