import { useState, useRef, useCallback } from "react";

interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
}

export function useVideoPlayer(
  onProgressUpdate?: (progress: number) => void
): UseVideoPlayerReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const play = useCallback(() => {
    videoRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      const progressPercent = (current / total) * 100;

      setCurrentTime(current);
      setProgress(progressPercent);

      // Call callback every 5 seconds or at specific milestones
      if (onProgressUpdate && Math.floor(current) % 5 === 0) {
        onProgressUpdate(progressPercent);
      }
    }
  }, [onProgressUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    play,
    pause,
    togglePlay,
    seek,
    handleTimeUpdate,
    handleLoadedMetadata,
  };
}
