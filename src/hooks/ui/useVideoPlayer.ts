import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoPlayerProps {
  onProgressUpdate?: (position: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
  completeThreshold?: number; // Percentage to mark as complete (default 90)
}

interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0-100
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
}

export function useVideoPlayer({
  onProgressUpdate,
  onComplete,
  initialPosition = 0,
  completeThreshold = 90,
}: UseVideoPlayerProps = {}): UseVideoPlayerReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedPosition = useRef(0);
  const hasMarkedComplete = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset completion flag when the target lesson changes (initialPosition changes per-lesson)
  useEffect(() => {
    hasMarkedComplete.current = false;
    lastSavedPosition.current = 0;
  }, [initialPosition]);

  // Seek to initial position when video loads
  useEffect(() => {
    if (videoRef.current && initialPosition > 0 && duration > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition, duration]);

  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play failed:", error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
      }
    },
    [duration]
  );

  const setVolume = useCallback((newVolume: number) => {
    if (videoRef.current) {
      const vol = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = vol;
      setVolumeState(vol);
      if (vol > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    const progressPercent = (current / total) * 100;

    setCurrentTime(current);
    setProgress(progressPercent);

    // Save progress every 5 seconds
    if (
      onProgressUpdate &&
      Math.abs(current - lastSavedPosition.current) >= 5
    ) {
      onProgressUpdate(current);
      lastSavedPosition.current = current;
    }

    // Mark as complete when threshold reached
    if (
      !hasMarkedComplete.current &&
      progressPercent >= completeThreshold &&
      onComplete
    ) {
      hasMarkedComplete.current = true;
      onComplete();
    }
  }, [onProgressUpdate, onComplete, completeThreshold]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    isFullscreen,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    handleTimeUpdate,
    handleLoadedMetadata,
  };
}
