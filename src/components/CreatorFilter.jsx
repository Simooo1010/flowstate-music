import React from 'react';
import { Plus, Disc, Sparkles, Flame, Check } from 'lucide-react';

export default function CreatorFilter({ 
  creators, 
  selectedCreatorId, 
  setSelectedCreatorId, 
  filterMode, 
  setFilterMode,
  onOpenAddModal 
}) {
  return (
    <div className="space-y-4">
      {/* Category / Mode Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition flex items-center gap-2 border ${
              filterMode === 'all'
                ? 'bg-white text-black border-white shadow-lg shadow-white/5'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Focus Tracks</span>
          </button>

          <button
            onClick={() => setFilterMode('longMixes')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition flex items-center gap-2 border ${
              filterMode === 'longMixes'
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Deep Mixes (1h+ Sets)</span>
          </button>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Music Creator</span>
        </button>
      </div>

      {/* Horizontal Creator Scroll Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCreatorId(null)}
          className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-medium transition border flex items-center gap-2 ${
            selectedCreatorId === null
              ? 'bg-zinc-100 text-zinc-900 border-white shadow-md font-semibold'
              : 'bg-dark-900/60 border-white/5 text-zinc-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>All Artists ({creators.length})</span>
        </button>

        {creators.map((c) => {
          const isSelected = selectedCreatorId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCreatorId(isSelected ? null : c.id)}
              className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-medium transition border flex items-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/25 font-semibold'
                  : 'bg-dark-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-dark-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400/80"></span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
