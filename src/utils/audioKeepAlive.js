// iOS Audio Session Keep-Alive & MediaSession API Integration

class AudioKeepAlive {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isActive = false;
  }

  // Unlocks audio context on user interaction (required by iOS Safari)
  init() {
    if (this.isActive) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = new AudioContext();

      // Silent buffer loop to keep iOS audio session awake
      const buffer = this.audioCtx.createBuffer(1, 1, 22050);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.audioCtx.destination);
      source.start();

      this.isActive = true;
      console.log('AudioKeepAlive: iOS audio session unlocked');
    } catch (e) {
      console.warn('AudioKeepAlive failed to init:', e);
    }
  }

  updateMediaSession(track, { onPlay, onPause, onNext, onPrev }) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.channelTitle,
        album: 'FlowState Zen Focus',
        artwork: [
          { src: track.thumbnail, sizes: '480x360', type: 'image/jpeg' },
          { src: track.thumbnail, sizes: '640x480', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', onPlay);
      navigator.mediaSession.setActionHandler('pause', onPause);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
      navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    } catch (e) {
      console.warn('MediaSession update error:', e);
    }
  }
}

export const audioKeepAlive = new AudioKeepAlive();
