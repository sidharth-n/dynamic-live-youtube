import { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { CommentDisplay } from './components/CommentDisplay';
import { ControlPanel } from './components/ControlPanel';
import { DivineParticles } from './components/DivineParticles';
import { useChatPoller } from './hooks/useChatPoller';

const extractVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

function App() {
  // Settings State - Hardcoded from env
  const [settings] = useState({
    youtubeApiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
    cartesiaApiKey: import.meta.env.VITE_CARTESIA_API_KEY || '',
    videoUrl: import.meta.env.VITE_VIDEO_URL || '',
    channelId: import.meta.env.VITE_CHANNEL_ID || '',
    volume: 80,
  });

  const [isActive, setIsActive] = useState(false);

  // Hook for logic
  const { currentComment, queueSize, isConnected, error, testAudio } = useChatPoller({
    isActive,
    youtubeApiKey: settings.youtubeApiKey,
    cartesiaApiKey: settings.cartesiaApiKey,
    videoId: extractVideoId(settings.videoUrl),
    channelId: settings.channelId,
    volume: settings.volume,
  });

  // Background Music Logic
  const [bgm] = useState(() => {
    const audio = new Audio('/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.2; // 20% volume
    return audio;
  });

  useEffect(() => {
    if (isActive) {
      bgm.play().catch(e => console.error("BGM play failed:", e));
    } else {
      bgm.pause();
    }
    return () => {
      bgm.pause();
    };
  }, [isActive, bgm]);

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      <Background imageUrl="/hanuman.png" />
      <DivineParticles />
      
      <CommentDisplay comment={currentComment} />

      <ControlPanel
        isActive={isActive}
        onToggleActive={() => {
          if (!isActive) {
            testAudio();
          }
          setIsActive(!isActive);
        }}
        queueSize={queueSize}
        isConnected={isConnected}
        error={error}
      />

      {/* Static Overlay Text */}
      {/* Static Overlay Text */}
      <div className="fixed bottom-0 left-0 w-full pb-12 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none px-4">
        <div className="text-center">
          <div className="text-yellow-100 font-serif text-4xl md:text-5xl lg:text-6xl tracking-widest uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,1)] animate-pulse font-bold">
            Comment your name to get blessings
          </div>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-4 shadow-[0_0_15px_rgba(234,179,8,1)]"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
