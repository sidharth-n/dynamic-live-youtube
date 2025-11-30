import React, { useEffect, useState, useRef } from 'react';

interface StatsPanelProps {
  roastCount: number;
  queueItems: string[]; // List of usernames
  isActive: boolean;
}

interface Notification {
  id: string;
  name: string;
  rank: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ roastCount, queueItems, isActive }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevQueueLengthRef = useRef(0);

  // Effect to trigger notifications when queue grows
  useEffect(() => {
    if (queueItems.length > prevQueueLengthRef.current) {
      // New item added!
      const newName = queueItems[queueItems.length - 1]; // Get the last added item
      const newNotification = {
        id: Date.now().toString(),
        name: newName,
        rank: roastCount + queueItems.length // Approximate rank
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 3)); // Keep max 3

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
    prevQueueLengthRef.current = queueItems.length;
  }, [queueItems.length, roastCount, queueItems]);

  if (!isActive) return null;

  return (
    <div className="fixed right-8 top-8 z-50 flex flex-col items-end gap-12 font-sans pointer-events-none">
      
      {/* 1. Roast Counter - BRIGHT & GLOWING */}
      <div className="flex flex-col items-end">
        <div 
          className="font-black uppercase tracking-widest text-4xl mb-2 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)]"
          style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
        >
          Victims Roasted
        </div>
        <div 
          className="font-black leading-none text-yellow-300"
          style={{ 
            fontSize: '10rem', 
            fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.6)) drop-shadow(0 4px 4px rgba(0,0,0,1))'
          }}
        >
          {roastCount}
        </div>
      </div>

      {/* 2. Notification Stack - POPUP & FADE */}
      <div className="flex flex-col items-end gap-6 w-[800px]">
        {notifications.map((note, index) => (
          <div 
            key={note.id}
            className="relative flex items-center justify-end w-full"
            style={{ 
              animation: `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
            }}
          >
            {/* Username */}
            <div 
              className="font-black text-white truncate text-right"
              style={{ 
                fontSize: '5rem',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                textShadow: '0 4px 8px rgba(0,0,0,1)',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
              }}
            >
              <span className="text-orange-400 mr-4">#{note.rank}</span>
              {note.name}
            </div>
            
            {/* "NEXT" Badge for the newest one */}
            {index === 0 && (
              <div className="absolute -right-4 -top-8 bg-red-600 text-white text-2xl font-bold px-4 py-2 rounded-full border-4 border-white animate-bounce shadow-xl rotate-12 z-10">
                NEXT!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

    </div>
  );
};
