import React from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    youtubeApiKey: string;
    cartesiaApiKey: string;
    videoUrl: string;
    volume: number;
  };
  onSettingsChange: (settings: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const handleChange = (field: string, value: any) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="text-purple-400" />
          Stream Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              YouTube API Key
            </label>
            <input
              type="password"
              value={settings.youtubeApiKey}
              onChange={(e) => handleChange('youtubeApiKey', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter YouTube Data API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cartesia API Key
            </label>
            <input
              type="password"
              value={settings.cartesiaApiKey}
              onChange={(e) => handleChange('cartesiaApiKey', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter Cartesia API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              YouTube Live Video URL or ID
            </label>
            <input
              type="text"
              value={settings.videoUrl}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Volume ({settings.volume}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => handleChange('volume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
