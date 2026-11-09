import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Maximize2, Minimize2, Shuffle, Repeat, ExternalLink, 
  ListMusic, Moon, Sparkles, AlertCircle
} from 'lucide-react';
import { audioKeepAlive } from '../utils/audioKeepAlive';

export default function Player({ 
  currentTrack, 
  isPlaying, 
  setIsPlaying, 
  onNext, 
  onPrev, 
  isShuffle, 
  setIsShuffle, 
  isRepeat, 
  setIsRepeat, 
  queue, 
  isZenMode, 
  setIsZenMode,
  isPip,
  setIsPip
}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playerReady, setPlayerReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const initPlayer = () => {
    if (!window.YT || !window.YT.Player) return;

    playerRef.current = new window.YT.Player('yt-embedded-frame', {
      height: '100%',
      width: '100%',
      videoId: currentTrack ? currentTrack.id : '',
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          setPlayerReady(true);
          if (currentTrack) {
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setErrorMsg(null);
            audioKeepAlive.init();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            // CONTINUOUS AUTOPLAY
            if (isRepeat) {
              playerRef.current.seekTo(0);
              playerRef.current.playVideo();
            } else {
              onNext();
            }
          }
        },
        onError: (e) => {
          console.warn('YouTube Player error code:', e.data);
          setErrorMsg('Track unavailable for embedding. Auto-skipping to next...');
          setTimeout(() => {
            setErrorMsg(null);
            onNext();
          }, 2000);
        }
      }
    });
  };

  // Load new track when currentTrack changes
  useEffect(() => {
    if (!currentTrack || !playerRef.current) return;

    if (playerReady && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById(currentTrack.id);
        setIsPlaying(true);
        audioKeepAlive.init();
      } catch (e) {
        console.warn('Error loading video:', e);
      }
    }

    // Update iOS lock screen controls
    audioKeepAlive.updateMediaSession(currentTrack, {
      onPlay: () => togglePlay(),
      onPause: () => togglePlay(),
      onNext: () => onNext(),
      onPrev: () => onPrev()
    });
  }, [currentTrack]);

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    audioKeepAlive.init();
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current || !playerReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(val);
      if (val === 0) setIsMuted(true);
      else if (isMuted) setIsMuted(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Floating Picture-in-Picture & Player Screen container */}
      <div 
        ref={containerRef}
        className={`transition-all duration-300 ease-out z-40 ${
          isPip 
            ? 'fixed bottom-24 right-4 w-72 md:w-96 aspect-video rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-black'
            : isZenMode 
              ? 'fixed inset-0 bg-dark-950 flex flex-col items-center justify-center p-6'
              : 'relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-dark-900/80 backdrop-blur-xl'
        }`}
      >
        {/* Error notification banner */}
        {errorMsg && (
          <div className="absolute top-3 left-3 right-3 z-50 bg-amber-500/90 text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur shadow-lg animate-bounce">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Video Canvas (embedded) */}
        <div className={`relative w-full ${isZenMode ? 'max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl' : 'aspect-video'}`}>
          <div id="yt-embedded-frame" className="w-full h-full"></div>
        </div>

        {/* Zen Mode Ambient Overlay */}
        {isZenMode && (
          <div className="mt-8 text-center max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deep Flow State</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1">{currentTrack.title}</h2>
            <p className="text-zinc-400 text-sm font-medium">{currentTrack.channelTitle} • {currentTrack.genre}</p>

            <div className="flex items-center justify-center gap-6 mt-6">
              <button onClick={onPrev} className="p-3 text-zinc-400 hover:text-white transition">
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={togglePlay} 
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-white/10"
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-1" />}
              </button>
              <button onClick={onNext} className="p-3 text-zinc-400 hover:text-white transition">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <button 
              onClick={() => setIsZenMode(false)}
              className="mt-8 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
            >
              Exit Zen Mode
            </button>
          </div>
        )}

        {/* Mini PiP close / restore overlay */}
        {isPip && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-50">
            <button 
              onClick={() => setIsPip(false)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur transition"
              title="Expand Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Docked Bottom Audio Bar (always accessible across whole app & iPhone) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark-900/90 backdrop-blur-2xl border-t border-white/10 px-4 py-3 pb-safe">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Track Info */}
          <div className="flex items-center gap-3.5 min-w-0 max-w-[40%] md:max-w-sm">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-1 h-3 bg-purple-400 animate-pulse rounded-full"></span>
                  <span className="w-1 h-4 bg-pink-400 animate-pulse delay-75 rounded-full"></span>
                  <span className="w-1 h-2 bg-blue-400 animate-pulse delay-150 rounded-full"></span>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                <span className="text-purple-400 font-medium">{currentTrack.channelTitle}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-500 font-mono">{currentTrack.genre}</span>
              </p>
            </div>
          </div>

          {/* Central Playback Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-lg transition hidden md:block ${isShuffle ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400 hover:text-white'}`}
              title="Shuffle queue"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button 
              onClick={onPrev}
              className="p-2 text-zinc-300 hover:text-white transition"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button 
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-white/10"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <button 
              onClick={onNext}
              className="p-2 text-zinc-300 hover:text-white transition"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-lg transition hidden md:block ${isRepeat ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400 hover:text-white'}`}
              title="Repeat Track"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools: PiP, Zen Mode, Volume */}
          <div className="flex items-center gap-2.5">
            {/* Volume slider (desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-zinc-400 mr-2">
              <button onClick={toggleMute} className="hover:text-white transition">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolume}
                className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* PiP Button */}
            <button 
              onClick={() => setIsPip(!isPip)}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-medium ${
                isPip 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title="Picture in Picture Mode"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">PiP</span>
            </button>

            {/* Zen Mode Button */}
            <button 
              onClick={() => setIsZenMode(!isZenMode)}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-medium ${
                isZenMode 
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300' 
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title="Full Zen Focus Mode"
            >
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Zen</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
