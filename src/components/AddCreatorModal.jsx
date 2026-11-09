import React, { useState } from 'react';
import { X, Plus, Sparkles, Loader2, Music } from 'lucide-react';
import { fetchChannelVideos } from '../utils/youtubeHelper';

export default function AddCreatorModal({ isOpen, onClose, onAddCreator }) {
  const [inputVal, setInputVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [genreVal, setGenreVal] = useState('Deep Focus / Beats');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsLoading(true);
    setError(null);

    let channelId = inputVal.trim();
    let handle = inputVal.trim();
    let name = nameVal.trim() || inputVal.trim();

    // Parse channel ID from full URL
    if (channelId.includes('channel/')) {
      const parts = channelId.split('channel/');
      channelId = parts[1].split('/')[0].split('?')[0];
    } else if (channelId.includes('@')) {
      handle = '@' + channelId.replace('@', '').split('/')[0].split('?')[0];
    }

    try {
      // Create new creator object
      const newCreator = {
        id: channelId.startsWith('UC') ? channelId : `custom_${Date.now()}`,
        name: name.replace('@', ''),
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        genre: genreVal
      };

      onAddCreator(newCreator);
      setInputVal('');
      setNameVal('');
      onClose();
    } catch (err) {
      setError('Could not add creator. Please check the channel handle or ID.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add Music Creator</h3>
            <p className="text-xs text-zinc-400">Curate only music you want to listen to</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Channel Handle, URL or Channel ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. @LofiGirl or UC..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Creator Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lofi Girl"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Genre / Vibe
            </label>
            <select
              value={genreVal}
              onChange={(e) => setGenreVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            >
              <option value="Jazz House / Lounge">Jazz House / Lounge</option>
              <option value="Deep Ambient / Lock-In">Deep Ambient / Lock-In</option>
              <option value="Lo-Fi / Coding Beats">Lo-Fi / Coding Beats</option>
              <option value="Cinematic / Film Score">Cinematic / Film Score</option>
              <option value="Deep Work Instrumental">Deep Work Instrumental</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add to Feed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
