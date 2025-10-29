/**
 * Utility functions for welcome video functionality
 */

export const WELCOME_VIDEO_STORAGE_KEY = 'welcome_video_seen';

/**
 * Check if user has seen the welcome video
 */
export const hasSeenWelcomeVideo = (): boolean => {
  return localStorage.getItem(WELCOME_VIDEO_STORAGE_KEY) === 'true';
};

/**
 * Mark welcome video as seen
 */
export const markWelcomeVideoAsSeen = (): void => {
  localStorage.setItem(WELCOME_VIDEO_STORAGE_KEY, 'true');
};

/**
 * Reset welcome video seen status
 */
export const resetWelcomeVideoSeen = (): void => {
  localStorage.removeItem(WELCOME_VIDEO_STORAGE_KEY);
};

/**
 * Check if welcome video should be shown based on user state
 */
export const shouldShowWelcomeVideo = (
  user: { is_onboarded?: boolean } | null,
  onboardingStatus: { is_onboarded?: boolean } | null
): boolean => {
  // Don't show if already seen
  if (hasSeenWelcomeVideo()) {
    return false;
  }

  // Show for new users or those who haven't completed onboarding
  return !!(user && (!user.is_onboarded || !onboardingStatus?.is_onboarded));
};

/**
 * Get video file path with fallback support
 */
export const getVideoSrc = (basePath: string = '/videos/welcome'): string => {
  // Check if WebM is supported
  const video = document.createElement('video');
  const webmSupported = video.canPlayType('video/webm; codecs="vp8, vorbis"');
  
  if (webmSupported) {
    return `${basePath}.webm`;
  }
  
  return `${basePath}.mp4`;
};

/**
 * Preload video for better performance
 */
export const preloadVideo = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.addEventListener('loadedmetadata', () => {
      resolve();
    });
    
    video.addEventListener('error', (e) => {
      reject(new Error(`Failed to load video: ${src}`));
    });
    
    video.src = src;
  });
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate video progress percentage
 */
export const calculateProgress = (currentTime: number, duration: number): number => {
  if (duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
};

/**
 * Check if video is supported in current browser
 */
export const isVideoSupported = (): boolean => {
  const video = document.createElement('video');
  return !!(video.canPlayType && video.canPlayType('video/mp4; codecs="avc1.42E01E"'));
};

/**
 * Get video dimensions for responsive sizing
 */
export const getVideoDimensions = (containerWidth: number, containerHeight: number, aspectRatio: number = 16/9) => {
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (containerAspectRatio > aspectRatio) {
    // Container is wider than video aspect ratio
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight
    };
  } else {
    // Container is taller than video aspect ratio
    return {
      width: containerWidth,
      height: containerWidth / aspectRatio
    };
  }
};
