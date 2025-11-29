import React from 'react';
import { Play, Square, Wifi, WifiOff, MessageSquare } from 'lucide-react';

interface ControlPanelProps {
  isActive: boolean;
  onToggleActive: () => void;
  queueSize: number;
  isConnected: boolean;
  error: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isActive,
  onToggleActive,
  queueSize,
  isConnected,
  error,
}) => {
  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-end">
      {error && (
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm max-w-xs shadow-lg backdrop-blur-sm mb-2 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Status Indicators */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-xl">
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            {isConnected ? (
              <Wifi size={18} className="text-green-400" />
            ) : (
              <WifiOff size={18} className="text-red-400" />
            )}
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <MessageSquare size={18} className="text-blue-400" />
            <span className="text-xs font-medium text-gray-300">
              Queue: {queueSize}
            </span>
          </div>
        </div>

        {/* Main Control Button */}
        <button
          onClick={onToggleActive}
          className={`
            group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105
            ${isActive 
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 ring-4 ring-red-500/30' 
              : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 ring-4 ring-green-500/30'
            }
          `}
          title={isActive ? 'Stop Stream' : 'Start Stream'}
        >
          {isActive ? (
            <Square size={28} className="text-white fill-current" />
          ) : (
            <Play size={32} className="text-white fill-current ml-1" />
          )}
          
          {/* Pulse Effect when Active */}
          {isActive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20"></span>
          )}
        </button>
      </div>
    </div>
  );
};
