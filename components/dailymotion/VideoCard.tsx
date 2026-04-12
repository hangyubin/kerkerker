import { Play } from 'lucide-react';
import type { DailymotionVideo } from '@/types/dailymotion';

interface VideoCardProps {
  video: DailymotionVideo;
  onClick: () => void;
  formatTimeAgo: (timestamp: string) => string;
}

export function VideoCard({ video, onClick, formatTimeAgo }: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-transform hover:scale-[1.01] duration-200"
    >
      <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-[var(--theme-background)]">
        {/* Background: Blurred thumbnail */}
        <img
          src={video.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
          aria-hidden="true"
        />
        
        {/* Foreground: Original size thumbnail (centered) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-2">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="max-w-full max-h-full rounded-lg"
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        {/* Eye-shaped mask overlay - larger lens */}
        <div 
          className="absolute inset-0 z-15"
          style={{
            background: `radial-gradient(ellipse 65% 48% at 50% 50%, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 75%, rgba(0, 0, 0, 0.95) 100%)`
          }}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 z-20" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
          <div className="w-16 h-16 bg-[var(--theme-primary)]/95 rounded-full flex items-center justify-center shadow-xl">
            <Play size={28} className="text-[var(--theme-text)] fill-[var(--theme-text)] ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-[var(--theme-background)]/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--theme-text)] z-30">
          {video.duration}
        </div>

        {/* 悬浮播放图标 - 中央位置 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
          <div className="w-16 h-16 bg-[var(--theme-primary)]/95 rounded-full flex items-center justify-center shadow-xl">
            <Play size={28} className="text-[var(--theme-text)] fill-[var(--theme-text)] ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
