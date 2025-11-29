import React, { useEffect, useState } from 'react';
import type { ChatMessage } from '../services/youtube';

interface CommentDisplayProps {
  comment: ChatMessage | null;
  roast: string | null;
}

export const CommentDisplay: React.FC<CommentDisplayProps> = ({ comment, roast }) => {
  const [visibleComment, setVisibleComment] = useState<ChatMessage | null>(null);
  const [visibleRoast, setVisibleRoast] = useState<string | null>(null);
  const [typedRoast, setTypedRoast] = useState<string>("");
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (comment) {
      setVisibleComment(comment);
      setIsExiting(false);
      
      // Reset roast when new comment appears
      setVisibleRoast(null);
      setTypedRoast("");

      // Auto-hide after 20 seconds (increased for longer reading time)
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
            setVisibleComment(null);
            setVisibleRoast(null);
            setTypedRoast("");
        }, 1000);
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [comment]);

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
    }
  }, [roast]);

  if (!visibleComment) return null;

  return (
    <div 
      className={`fixed left-12 top-1/2 -translate-y-1/2 z-30 w-[600px] transition-all duration-1000 ease-in-out ${
        isExiting ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'
      }`}
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
            {/* Original Comment */}
            <div className="mb-4">
                <p 
                    className="font-comic text-xl md:text-2xl italic"
                    style={{ color: '#FDBA74' }}
                >
                  "{visibleComment.message}"
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
                    <p 
                        className="font-comic text-sm uppercase tracking-wider"
                        style={{ color: '#FDBA74' }}
                    >
                        {visibleComment.authorName}
                    </p>
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
                </div>
            </div>

            {/* Roast (Typewriter) */}
            {visibleRoast && (
                <div className="mt-6 pt-6 border-t border-orange-500/30">
                    <p 
                        className="font-comic text-3xl md:text-4xl leading-relaxed drop-shadow-md font-bold"
                        style={{ color: '#FEF08A', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                    "{typedRoast}"
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
