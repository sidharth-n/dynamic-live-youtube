import React, { useEffect, useState, useRef } from 'react';

interface StatsPanelProps {
  roastCount: number;
  queueItems: string[]; // List of usernames
  isActive: boolean;
}

interface Notification {
  id: string;
  name: string;
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
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 3)); // Keep max 3

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 4000);
    }
    prevQueueLengthRef.current = queueItems.length;
  }, [queueItems.length, queueItems]);

  // Removed isActive check to keep overlay visible for OBS setup
  // if (!isActive) return null;

  return (
    <div className="fixed right-8 top-8 z-50 flex flex-col items-end gap-8 font-sans pointer-events-none">
      
      {/* 1. Roast Counter - BOXED & SINGLE LINE */}
      <div 
        className="relative p-6 rounded-2xl backdrop-blur-sm"
        style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
            borderColor: '#F97316', // Solid Orange
            borderWidth: '3px',
            boxShadow: '0 0 30px rgba(249, 115, 22, 0.6)' // Orange Glow
        }}
      >
        {/* Decorative Gradient Lines */}
        <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #F97316, transparent)' }}></div>
        <div className="absolute bottom-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #F97316, transparent)' }}></div>

        <div className="flex items-center gap-6">
          <span 
            className="font-black uppercase tracking-widest text-3xl text-white drop-shadow-md"
            style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
          >
            Victims Roasted:
          </span>
          <span 
            className="font-black leading-none text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ 
              fontSize: '5rem', 
              fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            }}
          >
            {roastCount}
          </span>
        </div>
      </div>

      {/* 2. Notification Stack - CLEAN USERNAMES ONLY */}
      <div className="flex flex-col items-end gap-4 w-[800px] mt-4">
        {notifications.map((note) => (
          <div 
            key={note.id}
            className="relative flex items-center justify-end w-full"
            style={{ 
              animation: `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
            }}
          >
            {/* Username */}
            <div 
              className="font-black text-white truncate text-right px-6 py-2"
              style={{ 
                fontSize: '4rem',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                textShadow: '0 4px 8px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))'
              }}
            >
              {note.name}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
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
