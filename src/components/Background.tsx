import React from 'react';

interface BackgroundProps {
  imageUrl?: string | null;
  isTalking?: boolean;
  mouthConfig?: {
    top: string;
    left: string;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
}

export const Background: React.FC<BackgroundProps> = ({ 
    imageUrl = '/doge_show_background.png', 
    isTalking = false,
    mouthConfig = { top: '50%', left: '50%', scaleX: 1.5, scaleY: 1.5, rotation: 0 }
}) => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Background"
          className="w-full h-full object-cover opacity-90"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center text-white/20">
          <span className="text-2xl">No Background Image Selected</span>
        </div>
      )}
      
      {/* Talking Mouth Overlay */}
      {isTalking && (
        <div 
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
                top: mouthConfig.top,
                left: mouthConfig.left,
                transform: `translate(-50%, -50%) rotate(${mouthConfig.rotation}deg) scale(${mouthConfig.scaleX}, ${mouthConfig.scaleY})`
            }}
        >
            <img 
                src="/mouth.gif" 
                alt="Talking Mouth" 
                className="w-32 h-auto object-contain" 
                style={{ 
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                }} 
            />
        </div>
      )}

      {/* Overlay gradient for better text readability if needed */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};
