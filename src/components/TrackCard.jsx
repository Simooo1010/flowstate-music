import React from 'react';
import { Play, Plus, Clock, ExternalLink, Flame } from 'lucide-react';

export default function TrackCard({ 
  track, 
  isCurrent, 
  isPlaying, 
  onPlay, 
  onAddToQueue 
}) {
  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
        isCurrent 
          ? 'bg-purple-950/20 border-purple-500/40 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/30' 
          : 'bg-dark-900/60 hover:bg-dark-800/80 border-white/5 hover:border-white/10 hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <img 
          src={track.thumbnail} 
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>

        {/* Long Mix / Set Badge */}
        {track.isLongMix && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
            <Flame className="w-3 h-3 text-purple-400" />
            <span>Deep Set</span>
          </div>
        )}

        {/* Hover / Active Play Button Overlay */}
        <button
          onClick={() => onPlay(track)}
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px]'
          }`}
          title={isCurrent && isPlaying ? "Currently playing" : "Play track"}
        >
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition">
            {isCurrent && isPlaying ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-black animate-pulse rounded-full"></span>
                <span className="w-1 h-4 bg-black animate-pulse delay-75 rounded-full"></span>
                <span className="w-1 h-2 bg-black animate-pulse delay-150 rounded-full"></span>
              </div>
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-purple-400 truncate tracking-wide">
              {track.channelTitle}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono shrink-0">
              {track.published ? new Date(track.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 group-hover:text-white transition leading-snug">
            {track.title}
          </h3>
        </div>

        {/* Action Bottom Row */}
        <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[140px]">
            {track.genre || 'Flow State'}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddToQueue(track)}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
              title="Add to queue"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-zinc-300 transition"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
