import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';

export interface DynamicLyric {
  time: number;
  text: string;
}

interface DynamicLyricsViewerProps {
  youtubeVideoId: string;
  lyrics: DynamicLyric[];
}

export const DynamicLyricsViewer: React.FC<DynamicLyricsViewerProps> = ({ youtubeVideoId, lyrics: initialLyrics }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Sync Mode State
  const [isSyncMode, setIsSyncMode] = useState(false);
  const [syncedLyrics, setSyncedLyrics] = useState<DynamicLyric[]>(initialLyrics);
  const [syncIndex, setSyncIndex] = useState(0);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) setIsPlaying(true);
    else setIsPlaying(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && player) {
      interval = setInterval(async () => {
        try {
          const time = await player.getCurrentTime();
          setCurrentTime(time);
        } catch (e) {}
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  // Handle Syncing
  const handleSyncNext = () => {
    if (syncIndex < syncedLyrics.length) {
      setSyncedLyrics((prev) => {
        const newArr = [...prev];
        newArr[syncIndex] = { ...newArr[syncIndex], time: currentTime };
        return newArr;
      });
      setSyncIndex((prev) => prev + 1);
    }
  };

  // Keyboard shortcut for syncing (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSyncMode && e.code === 'Space') {
        e.preventDefault();
        handleSyncNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSyncMode, syncIndex, currentTime]);

  // Find active lyric index (only in normal mode)
  let activeIndex = -1;
  if (!isSyncMode) {
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (currentTime >= syncedLyrics[i].time) activeIndex = i;
      else break;
    }
  } else {
    activeIndex = syncIndex;
  }

  // Auto-scroll logic
  useEffect(() => {
    if (activeIndex !== -1 && scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeIndex]);

  const handleLyricClick = (time: number) => {
    if (player && !isSyncMode) {
      player.seekTo(time, true);
      if (!isPlaying) player.playVideo();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden YouTube Player */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-rose-100 dark:border-rose-900/30">
        <YouTube
          videoId={youtubeVideoId}
          opts={{
            height: '180',
            width: '100%',
            playerVars: { autoplay: 1, controls: 1 },
          }}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="w-full"
        />
      </div>

      {/* Sync Mode Toggle & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-amber-200/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsSyncMode(!isSyncMode);
              if (!isSyncMode) {
                // Reset sync state
                setSyncedLyrics(initialLyrics.map(l => ({ ...l, time: 0 })));
                setSyncIndex(0);
              } else {
                // Return to normal mode, keep current initialLyrics
                setSyncedLyrics(initialLyrics);
              }
            }}
            className="text-xs font-bold px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full transition-all"
          >
            {isSyncMode ? "Exit Sync Mode" : "Enable Musixmatch Sync Mode"}
          </button>
          
          {isSyncMode && (
             <span className="text-xs text-rose-600 font-bold animate-pulse">
               SYNCING MODE ACTIVE
             </span>
          )}
        </div>

        {isSyncMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNext}
              disabled={syncIndex >= syncedLyrics.length}
              className="text-xs font-bold px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all disabled:opacity-50"
            >
              Sync Next Line (Space)
            </button>
            <button
              onClick={() => {
                const output = syncedLyrics.map(l => `{ time: ${l.time.toFixed(1)}, text: "${l.text}" }`).join(',\n      ');
                navigator.clipboard.writeText(output);
                alert("Copied generated timestamps to clipboard! Send this array back to the AI.");
              }}
              className="text-xs font-bold px-3 py-1.5 bg-gray-800 text-white rounded-full transition-all"
            >
              Copy Timestamps
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Lyrics Scroller */}
      <div 
        ref={scrollContainerRef}
        className="h-[400px] overflow-y-auto rounded-xl bg-rose-50/50 dark:bg-rose-950/20 p-8 space-y-6 border border-rose-100/50 dark:border-rose-900/20 scrollbar-hide relative shadow-inner"
        style={{ scrollBehavior: 'smooth' }}
      >
        {syncedLyrics.length > 0 ? (
          syncedLyrics.map((lyric, index) => {
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;
            
            return (
              <div 
                key={index}
                onClick={() => handleLyricClick(lyric.time)}
                className={`transition-all duration-500 ease-in-out ${!isSyncMode ? 'cursor-pointer' : ''} group flex items-center justify-center text-center px-4 ${
                  isActive 
                    ? 'scale-110 opacity-100 font-bold text-rose-600 dark:text-rose-400 drop-shadow-sm'
                    : isPassed 
                      ? 'scale-100 opacity-60 text-gray-700 dark:text-gray-300'
                      : 'scale-95 opacity-40 text-gray-500 dark:text-gray-500 hover:opacity-70'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xl md:text-2xl md:leading-relaxed font-serif tracking-wide">{lyric.text}</p>
                  {isSyncMode && (
                    <span className="text-[10px] font-mono text-gray-400">
                      {lyric.time > 0 ? `${lyric.time.toFixed(1)}s` : 'Waiting...'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-rose-400 font-serif opacity-50">
            No dynamic lyrics available.
          </div>
        )}
      </div>
    </div>
  );
};
