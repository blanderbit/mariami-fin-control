import React from 'react';
import { Play, Settings, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeVideoSettingsProps {
  onShowVideo: () => void;
  onResetVideoSeen: () => void;
  hasSeenVideo: boolean;
}

const WelcomeVideoSettings: React.FC<WelcomeVideoSettingsProps> = ({
  onShowVideo,
  onResetVideoSeen,
  hasSeenVideo
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Settings className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Welcome Video Settings
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              {hasSeenVideo ? (
                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Video Status
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasSeenVideo 
                  ? 'You have watched the welcome video' 
                  : 'You haven\'t watched the welcome video yet'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onShowVideo}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Watch Welcome Video</span>
          </button>

          {hasSeenVideo && (
            <button
              onClick={onResetVideoSeen}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Reset Video Status
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            The welcome video introduces you to FinclAI's key features and helps you get started.
            You can watch it anytime or reset your viewing status to see it again on next login.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeVideoSettings;
