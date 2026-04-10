'use client';

import { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { DoubanMovie } from '@/types/douban';

interface DoubanCardProps {
  movie: DoubanMovie;
  onSelect: (movie: DoubanMovie) => void;
  /** 是否为首屏可见卡片，优先加载 */
  priority?: boolean;
}

export default function DoubanCard({ movie, onSelect, priority = false }: DoubanCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
 
  // 豆瓣图片使用代理
  const imageUrl = `/api/image-proxy?url=${encodeURIComponent(movie.cover)}`;

  return (
    <div
      onClick={() => onSelect(movie)}
      className="group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30"
    >
      {/* 海报图片 */}
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-[var(--theme-surface)] shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-black/70 transition-all duration-500 hover:shadow-[var(--theme-primary)]/20 border border-transparent hover:border-[var(--theme-primary)]/30">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={movie.title}
            // 非首屏图片使用懒加载，不阻塞 hydration
            loading={priority ? "eager" : "lazy"}
            // 首屏图片优先加载
            fetchPriority={priority ? "high" : "auto"}
            // 提供尺寸提示，避免布局偏移
            decoding="async"
            className={`w-full h-full object-cover transition-opacity duration-300 transition-transform duration-700 group-hover:scale-110 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[var(--theme-card)]">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* 加载状态 */}
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-surface)]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]" />
          </div>
        )}

        {/* 评分标签 */}
        {movie.rate  && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-full text-yellow-400 text-sm font-bold flex items-center space-x-1 transform transition-all duration-300 group-hover:scale-110">
            <Star className="w-4 h-4 fill-current" />
            <span>{movie.rate}</span>
          </div>
        )}
 
      </div>

      {/* 悬浮信息层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl flex flex-col justify-end p-4 transform group-hover:translate-y-0 translate-y-4">
        <h3 className="text-[var(--theme-text)] font-bold text-base mb-2 line-clamp-2 drop-shadow-lg transition-all duration-300 group-hover:translate-y-0 translate-y-2">
          {movie.title}
        </h3>
        
        {movie.episode_info && movie.episode_info.length > 0 && (
          <p className="text-[var(--theme-textSecondary)] text-xs mb-2 drop-shadow-md transition-all duration-300 delay-100 group-hover:translate-y-0 translate-y-2">
            {movie.episode_info}
          </p>
        )}

        {/* 播放按钮 */}
        <div className="mt-3 flex items-center space-x-2 transition-all duration-300 delay-200 group-hover:translate-y-0 translate-y-2">
          <button className="flex items-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-text)] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[var(--theme-primary)]/80 hover:scale-105 transition-all duration-300 shadow-2xl shadow-[var(--theme-primary)]/20 hover:shadow-[var(--theme-primary)]/30">
            <Play className="w-4 h-4 fill-[var(--theme-text)]" />
            <span>立即播放</span>
          </button>
        </div>
      </div>
    </div>
  );
}
