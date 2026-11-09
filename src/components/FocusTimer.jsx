import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

export default function FocusTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25 * 60);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const selectDuration = (minutes) => {
    const totalSecs = minutes * 60;
    setDuration(totalSecs);
    setSecondsLeft(totalSecs);
    setIsActive(false);
    setShowDropdown(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(duration);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - secondsLeft) / duration) * 100;

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 px-3 gap-2 backdrop-blur-md">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-purple-300 hover:text-white transition"
          title="Change focus timer interval"
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{formatTime(secondsLeft)}</span>
        </button>

        <button 
          onClick={() => setIsActive(!isActive)}
          className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition"
          title={isActive ? "Pause Focus Timer" : "Start Focus Timer"}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        <button 
          onClick={resetTimer}
          className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition"
          title="Reset timer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-dark-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 min-w-[140px] flex flex-col gap-1 backdrop-blur-xl">
          {[
            { label: '25m Pomodoro', mins: 25 },
            { label: '50m Deep Flow', mins: 50 },
            { label: '90m Ultradian', mins: 90 },
            { label: '15m Quick Sprint', mins: 15 }
          ].map((item) => (
            <button
              key={item.mins}
              onClick={() => selectDuration(item.mins)}
              className={`text-left px-3 py-1.5 text-xs rounded-xl transition ${
                duration === item.mins * 60 
                  ? 'bg-purple-500/20 text-purple-300 font-semibold' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
