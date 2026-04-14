'use client';

import { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { DoubanMovie } from '@/types/douban';

interface DoubanCardProps {
  movie: DoubanMovie;
  onSelect: (movie: DoubanMovie) => void;
  /** 是否为首屏可见卡片，优先加载 */
  priority?: boolean;
  /** 源数量 */
  sourceCount?: number;
  /** 可用源列表 */
  sources?: string[];
}

export default function DoubanCard({ movie, onSelect, priority = false, sourceCount, sources }: DoubanCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
 
  // 豆瓣图片使用代理
  const imageUrl = `/api/image-proxy?url=${encodeURIComponent(movie.cover)}`;

  // 内联样式
  const containerStyle = {
    position: 'relative' as const,
    cursor: 'pointer' as const,
  };

  const imageContainerStyle = {
    position: 'relative' as const,
    aspectRatio: '2/3' as const,
    borderRadius: '1rem' as const,
    overflow: 'hidden' as const,
    backgroundColor: 'var(--theme-surface)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease' as const,
  };

  const handleImageContainerMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    e.currentTarget.style.opacity = '0.95';
    e.currentTarget.style.transform = 'scale(1.01)';
  };

  const handleImageContainerMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };

  const imageStyle = {
    width: '100%' as const,
    height: '100%' as const,
    objectFit: 'cover' as const,
    transition: 'opacity 0.3s ease',
    opacity: isLoading ? 0 : 1,
  };

  const errorContainerStyle = {
    width: '100%' as const,
    height: '100%' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: 'var(--theme-textSecondary)',
    backgroundColor: 'var(--theme-card)',
  };

  const loadingContainerStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'var(--theme-surface)',
  };

  const ratingStyle = {
    position: 'absolute' as const,
    top: '0.5rem' as const,
    left: '0.5rem' as const,
    padding: '0.25rem 0.5rem' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.8)' as const,
    backdropFilter: 'blur(4px)' as const,
    borderRadius: '9999px' as const,
    color: '#facc15' as const,
    fontSize: '0.875rem' as const,
    fontWeight: 'bold' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.25rem' as const,
  };

  const hoverEffectStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)' as const,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const playButtonStyle = {
    width: '3rem' as const,
    height: '3rem' as const,
    backgroundColor: 'var(--theme-primary)',
    borderRadius: '50%' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: 'var(--theme-text)',
  };

  const titleContainerStyle = {
    marginTop: '0.5rem' as const,
    textAlign: 'center' as const,
  };

  const titleStyle = {
    fontSize: '0.875rem' as const,
    fontWeight: 500 as const,
    color: 'var(--theme-text)',
    display: '-webkit-box' as const,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
    transition: 'color 0.2s ease',
  };

  const episodeInfoStyle = {
    fontSize: '0.75rem' as const,
    color: 'var(--theme-textSecondary)',
    marginTop: '0.25rem' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  };

  return (
    <div 
      style={{
        ...containerStyle,
      }} 
      onClick={() => onSelect(movie)}
    >
      {/* 海报图片容器 */}
      <div 
        style={imageContainerStyle}
        onMouseEnter={handleImageContainerMouseEnter}
        onMouseLeave={handleImageContainerMouseLeave}
      >
        {/* 图片 */}
        {!imageError ? (
          <img
            src={imageUrl}
            alt={movie.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            style={imageStyle}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div style={errorContainerStyle}>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* 加载状态 */}
        {isLoading && !imageError && (
          <div style={loadingContainerStyle}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]" />
          </div>
        )}

        {/* 评分标签 */}
        {movie.rate && (
          <div style={ratingStyle}>
            <Star className="w-4 h-4 fill-current" />
            <span>{movie.rate}</span>
          </div>
        )}

        {/* 源数量标识 - 放在图片右下角 */}
        {sourceCount && (
          <div style={{
            position: 'absolute' as const,
            bottom: '0.5rem' as const,
            right: '0.5rem' as const,
            zIndex: 40,
          }}>
            <div className="relative group">
              <div className="bg-[var(--theme-primary)] text-[var(--theme-text)] text-xs font-bold px-2 py-1 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
                {sourceCount}
              </div>
              {/* 悬停提示 - 只有悬停在数字标签上时才显示 */}
              {sources && sources.length > 0 && (
                <div className="absolute bottom-full right-0 mb-2 bg-[var(--theme-background)]/90 backdrop-blur-md text-[var(--theme-text)] text-xs p-2 rounded-md shadow-xl w-56 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-[var(--theme-border)]">
                  <div className="space-y-1">
                    {sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* 悬浮效果 */}
        <div 
          style={hoverEffectStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        >
          <div style={playButtonStyle}>
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* 卡片下方标题 */}
      <div style={titleContainerStyle}>
        <h3 
          style={titleStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--theme-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theme-text)';
          }}
        >
          {movie.title}
        </h3>
        {movie.episode_info && movie.episode_info.length > 0 && (
          <p style={episodeInfoStyle}>
            {movie.episode_info}
          </p>
        )}
      </div>
    </div>
  );
}
