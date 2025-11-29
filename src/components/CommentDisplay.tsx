import React, { useEffect, useState } from 'react';
import type { ChatMessage } from '../services/youtube';

interface CommentDisplayProps {
  comment: ChatMessage | null;
}

export const CommentDisplay: React.FC<CommentDisplayProps> = ({ comment }) => {
  const [visibleComment, setVisibleComment] = useState<ChatMessage | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (comment) {
      setVisibleComment(comment);
      setIsExiting(false);

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsExiting(true);
        // Clear from DOM after animation
        setTimeout(() => setVisibleComment(null), 1000);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [comment]);

  if (!visibleComment) return null;

  return (
    <div 
      className={`
        fixed left-12 top-1/2 -translate-y-1/2 z-30 max-w-md w-full
        transition-all duration-1000 ease-in-out transform
        ${isExiting ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="relative">
        {/* Divine Glow Effect */}
        <div className="absolute -inset-4 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
        
        {/* Card Container */}
        <div className="relative bg-black/80 backdrop-blur-xl border border-yellow-500/50 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          
          <div className="text-center space-y-4">
            <div className="text-yellow-200/80 text-sm font-serif tracking-[0.2em] uppercase">
              Divine Blessing
            </div>
            
            <div className="text-3xl md:text-4xl font-serif text-white leading-relaxed drop-shadow-lg">
              "I bless you, <span className="text-yellow-400 font-semibold">{visibleComment.message}</span>"
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/40 text-xs mt-4">
              <span className="w-8 h-px bg-white/20"></span>
              <span>✦</span>
              <span className="w-8 h-px bg-white/20"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
