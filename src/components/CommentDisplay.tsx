import React, { useEffect, useState } from 'react';
import type { ChatMessage } from '../services/youtube';

interface CommentDisplayProps {
  roast: string | null;
}

export const CommentDisplay: React.FC<CommentDisplayProps> = ({ roast }) => {
  const [visibleRoast, setVisibleRoast] = useState<string | null>(null);
  const [typedRoast, setTypedRoast] = useState<string>("");

  // Typewriter Effect
  useEffect(() => {
    if (roast) {
        setVisibleRoast(roast);
        setTypedRoast("");
        
        let i = 0;
        const speed = 50; // ms per character
        
        const typeInterval = setInterval(() => {
            if (i < roast.length) {
                setTypedRoast(prev => prev + roast.charAt(i));
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);

        return () => clearInterval(typeInterval);
    } else {
        setVisibleRoast(null);
        setTypedRoast("");
    }
  }, [roast]);

  if (!visibleRoast) return null;

  return (
    <div 
      className="fixed left-12 top-1/2 -translate-y-1/2 z-30 w-[600px] transition-all duration-1000 ease-in-out opacity-100 translate-x-0"
    >
      <div className="relative">
        {/* Glow Effect - Simplified for OBS */}
        <div 
            className="absolute -inset-4 blur-xl rounded-full animate-pulse"
            style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)' }}
        ></div>
        
        {/* Card Container */}
        <div 
            className="relative p-8 rounded-2xl overflow-hidden"
            style={{
                backgroundColor: '#000000', // Solid black for OBS
                borderColor: '#F97316', // Solid Orange
                borderWidth: '2px',
                boxShadow: '0 0 30px rgba(249, 115, 22, 0.8)' // Stronger shadow
            }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #F97316, transparent)' }}></div>
          <div className="absolute bottom-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #F97316, transparent)' }}></div>
          
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #F97316)' }}></div>
            <span 
                className="mx-4 font-comic tracking-[0.2em] text-lg uppercase font-bold"
                style={{ color: '#FB923C' }}
            >
                Doge Roast
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(270deg, transparent, #F97316)' }}></div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Roast (Typewriter) */}
            <div className="mt-2">
                <p 
                    className="font-comic text-3xl md:text-4xl leading-relaxed drop-shadow-md font-bold"
                    style={{ color: '#FEF08A', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                "{typedRoast}"
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
