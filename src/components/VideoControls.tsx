import React from 'react';
import { Play, Pause, VolumeX, Volume2, Monitor, Maximize2 } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  isPipActive: boolean;
  setIsPipActive: (pip: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  toggleFullscreen: () => void;
  formatTime: (seconds: number) => string;
}

export default function VideoControls({
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  handleSeekChange,
  isMuted,
  toggleMute,
  volume,
  handleVolumeChange,
  playbackSpeed,
  setPlaybackSpeed,
  isPipActive,
  setIsPipActive,
  videoRef,
  toggleFullscreen,
  formatTime,
}: VideoControlsProps) {
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto font-sans"
    >
      {/* Progress Bar / Scrubber */}
      <div className="flex items-center gap-3 relative w-full">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-white/30 hover:h-2 transition-all outline-none"
          style={{
            background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
          }}
        />
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between text-white text-xs gap-2">
        {/* Left Side: Play, Time, Volume */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={togglePlay}
            className="p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none text-white font-sans flex items-center justify-center shrink-0"
            title={isPlaying ? "ផ្អាក" : "ចាក់"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-white" />}
          </button>

          {/* Time Indicator */}
          <div className="font-mono text-[10px] sm:text-[11px] text-slate-200 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Volume section */}
          <div className="hidden sm:flex items-center gap-1 group/volume shrink-0">
            <button
              onClick={toggleMute}
              className="p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none text-white flex items-center justify-center"
              title={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden sm:block w-12 md:w-16 h-1 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-white/30 hover:bg-white/40 outline-none transition-all"
              style={{
                background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
              }}
            />
          </div>
        </div>

        {/* Right Side: Speed badge, PIP, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-lg border border-white/10">
            <span className="hidden sm:inline-block text-[10px] text-slate-300">ល្បឿន៖</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-[10px] text-white font-bold font-mono outline-none cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>

          <button
            onClick={() => {
              setIsPipActive(!isPipActive);
              if (videoRef.current) {
                if (document.pictureInPictureElement) {
                  document.exitPictureInPicture();
                } else {
                  videoRef.current.requestPictureInPicture().catch(e => {
                    console.log('PIP error:', e);
                  });
                }
              }
            }}
            className={`hidden sm:flex p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none items-center justify-center shrink-0 ${isPipActive ? 'text-orange-500' : 'text-white'}`}
            title="Picture in Picture"
          >
            <Monitor className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none text-white flex items-center justify-center shrink-0"
            title="ពេញអេក្រង់"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
