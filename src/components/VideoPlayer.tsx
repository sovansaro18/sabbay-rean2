import React, { useEffect } from 'react';
import { Pause, Play } from 'lucide-react';
import { Lesson } from '../types';
import VideoControls from './VideoControls';

interface VideoPlayerProps {
  selectedLesson: Lesson;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoContainerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  isPipActive: boolean;
  setIsPipActive: (pip: boolean) => void;
  autoNext?: boolean;
  handleNextLesson: () => void;
  videoQuality?: string;
}

export default function VideoPlayer({
  selectedLesson,
  videoRef,
  videoContainerRef,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  duration,
  setDuration,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  isFullscreen,
  setIsFullscreen,
  playbackSpeed,
  setPlaybackSpeed,
  isPipActive,
  setIsPipActive,
  autoNext = true,
  handleNextLesson,
  videoQuality = '720p',
}: VideoPlayerProps) {
  
  // Extract YouTube ID
  const getYouTubeEmbedId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const isDirectVideo = (url: string) => {
    if (!url) return false;
    return (
      url.includes('.mp4') ||
      url.includes('.webm') ||
      url.includes('.ogg') ||
      url.includes('cloudinary.com') ||
      url.includes('/video/upload/')
    );
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.log('Playback error:', err));
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    if (vol > 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error('Fullscreen error:', err);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync playback rate with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, selectedLesson, videoRef]);

  // Handle Fullscreen escape change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  if (isDirectVideo(selectedLesson.videoUrl)) {
    return (
      <div
        ref={videoContainerRef}
        className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group select-none"
      >
        <video
          ref={videoRef}
          src={selectedLesson.videoUrl}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          playsInline
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onDurationChange={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (autoNext) {
              handleNextLesson();
            }
          }}
        />

        {/* Floating Center Play/Pause button on screen */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
        >
          <div
            className={`p-5 rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-300 transform ${
              isPlaying
                ? 'scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                : 'scale-100 opacity-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white text-white" />
            ) : (
              <Play className="w-8 h-8 fill-white text-white translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Custom video controls */}
        <VideoControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          currentTime={currentTime}
          duration={duration}
          handleSeekChange={handleSeekChange}
          isMuted={isMuted}
          toggleMute={toggleMute}
          volume={volume}
          handleVolumeChange={handleVolumeChange}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          isPipActive={isPipActive}
          setIsPipActive={setIsPipActive}
          videoRef={videoRef}
          toggleFullscreen={toggleFullscreen}
          formatTime={formatTime}
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group">
      <iframe
        title={selectedLesson.title}
        src={`https://www.youtube.com/embed/${getYouTubeEmbedId(
          selectedLesson.videoUrl
        )}?autoplay=1&enablejsapi=1`}
        className="absolute inset-0 w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Floating Quality and Speed Badges */}
      <div className="absolute top-3 right-3 flex gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 font-sans">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
          {videoQuality}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
          {playbackSpeed}x
        </span>
      </div>
    </div>
  );
}
