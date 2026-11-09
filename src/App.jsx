import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Search, RefreshCw, Layers, ShieldCheck, 
  Smartphone, Volume2, Compass, Radio, Heart
} from 'lucide-react';

import initialData from './data/creators_data.json';
import Player from './components/Player';
import FocusTimer from './components/FocusTimer';
import CreatorFilter from './components/CreatorFilter';
import TrackCard from './components/TrackCard';
import AddCreatorModal from './components/AddCreatorModal';
import { fetchChannelVideos } from './utils/youtubeHelper';

export default function App() {
  const [creators, setCreators] = useState(() => {
    const saved = localStorage.getItem('flowstate_creators');
    return saved ? JSON.parse(saved) : initialData.creators;
  });

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('flowstate_videos');
    return saved ? JSON.parse(saved) : initialData.videos;
  });

  const [currentTrack, setCurrentTrack] = useState(() => {
    return initialData.videos[0] || null;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'longMixes'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture PWA install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('To install on iPhone: tap the Share button in Safari and choose "Add to Home Screen" 📲');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // Filtered tracks
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Creator filter
      if (selectedCreatorId && video.channelId !== selectedCreatorId) {
        return false;
      }
      // Mode filter
      if (filterMode === 'longMixes' && !video.isLongMix) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = video.title.toLowerCase().includes(q);
        const matchArtist = video.channelTitle.toLowerCase().includes(q);
        const matchGenre = (video.genre || '').toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchGenre) return false;
      }
      return true;
    });
  }, [videos, selectedCreatorId, filterMode, searchQuery]);

  // Next Track Logic (Handles continuous autoplay)
  const handleNext = () => {
    // 1. If queue has items, pop from queue
    if (queue.length > 0) {
      const [nextTrack, ...rest] = queue;
      setQueue(rest);
      setCurrentTrack(nextTrack);
      return;
    }

    const currentList = filteredVideos.length > 0 ? filteredVideos : videos;
    if (currentList.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * currentList.length);
      setCurrentTrack(currentList[randomIndex]);
    } else {
      const currentIndex = currentList.findIndex((v) => v.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % currentList.length;
      setCurrentTrack(currentList[nextIndex]);
    }
  };

  const handlePrev = () => {
    const currentList = filteredVideos.length > 0 ? filteredVideos : videos;
    if (currentList.length === 0) return;

    const currentIndex = currentList.findIndex((v) => v.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    setCurrentTrack(currentList[prevIndex]);
  };

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleAddToQueue = (track) => {
    setQueue((prev) => [...prev, track]);
  };

  const handleAddCreator = (newCreator) => {
    const updated = [newCreator, ...creators];
    setCreators(updated);
    localStorage.setItem('flowstate_creators', JSON.stringify(updated));

    // Try fetching their videos live
    fetchChannelVideos(newCreator.id, newCreator.name, newCreator.handle, newCreator.genre)
      .then((newVideos) => {
        if (newVideos.length > 0) {
          const merged = [...newVideos, ...videos];
          setVideos(merged);
          localStorage.setItem('flowstate_videos', JSON.stringify(merged));
        }
      });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    let refreshed = [...videos];
    for (const c of creators.slice(0, 5)) {
      const fetched = await fetchChannelVideos(c.id, c.name, c.handle, c.genre);
      if (fetched.length > 0) {
        // Prepend new unique videos
        for (const item of fetched) {
          if (!refreshed.some((v) => v.id === item.id)) {
            refreshed.unshift(item);
          }
        }
      }
    }
    setVideos(refreshed);
    localStorage.setItem('flowstate_videos', JSON.stringify(refreshed));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white pb-32">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  FLOWSTATE
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-400 font-semibold">
                  ZEN
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">Zero distraction • Only your music</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search artists, tracks, or mixes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 transition backdrop-blur-md"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <FocusTimer />

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Refresh feeds"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <button
              onClick={handleInstallPWA}
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Install on iPhone / Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">PWA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 space-y-8 flex-grow">
        
        {/* Mobile Search input */}
        <div className="relative md:hidden">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search artists, tracks, or mixes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Top Hero / Video Player Section */}
        <section>
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={handleNext}
            onPrev={handlePrev}
            isShuffle={isShuffle}
            setIsShuffle={setIsShuffle}
            isRepeat={isRepeat}
            setIsRepeat={setIsRepeat}
            queue={queue}
            isZenMode={isZenMode}
            setIsZenMode={setIsZenMode}
            isPip={isPip}
            setIsPip={setIsPip}
          />
        </section>

        {/* Creator Filters & Categories */}
        <section>
          <CreatorFilter
            creators={creators}
            selectedCreatorId={selectedCreatorId}
            setSelectedCreatorId={setSelectedCreatorId}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        </section>

        {/* Clean Feed Section Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              {selectedCreatorId 
                ? creators.find(c => c.id === selectedCreatorId)?.name 
                : filterMode === 'longMixes' ? 'Deep Focus Mixes' : 'Focus Playlist'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-mono text-zinc-400">
              {filteredVideos.length} tracks
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shorts & Reels Blocked</span>
          </div>
        </div>

        {/* Video Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredVideos.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              onPlay={handlePlayTrack}
              onAddToQueue={handleAddToQueue}
            />
          ))}
        </section>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20 bg-dark-900/40 rounded-3xl border border-white/5">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No tracks found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try switching creator filter or search terms</p>
          </div>
        )}
      </main>

      {/* Add Creator Modal */}
      <AddCreatorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCreator={handleAddCreator}
      />
    </div>
  );
}
