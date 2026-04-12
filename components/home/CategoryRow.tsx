import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import type { DoubanMovie } from "@/types/douban";
import DoubanCard from "@/components/DoubanCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryRowProps {
  title: string;
  icon: ReactElement;
  movies: DoubanMovie[];
  onMovieClick: (movie: DoubanMovie) => void;
  onViewMore: () => void;
}

export function CategoryRow({
  title,
  icon,
  movies,
  onMovieClick,
  onViewMore,
}: CategoryRowProps) {
  const INITIAL_DISPLAY_COUNT = 15;
  const displayMovies = movies.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = movies.length > INITIAL_DISPLAY_COUNT;
  const [showButtons, setShowButtons] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 检查是否需要显示滚动按钮
  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setShowButtons(container.scrollWidth > container.clientWidth);
    }
  };

  // 滚动到左侧
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  // 滚动到右侧
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // 鼠标滚轮滚动支持
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      // 只处理水平滚动，忽略垂直滚动
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        scrollContainerRef.current.scrollBy({ left: e.deltaX, behavior: 'smooth' });
      }
    }
  };

  // 组件挂载后和窗口大小变化时检查滚动容器宽度
  useEffect(() => {
    // 初始检查
    checkScrollable();

    // 窗口大小变化时重新检查
    window.addEventListener('resize', checkScrollable);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [displayMovies.length]);

  return (
    <div className="px-4 md:px-12">
      {/* 标题和查看更多 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[var(--theme-text)] flex items-center gap-3 relative">
          <span className="absolute -left-4 top-0 bottom-0 w-1 bg-[var(--theme-primary)] rounded-full"></span>
          {icon}
          <span>{title}</span>
        </h2>
        {hasMore && (
          <button
            onClick={onViewMore}
            className="text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors flex items-center space-x-1 group"
          >
            <span>查看全部</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 横向滚动列表 */}
      <div className="relative">
        {/* 左侧滚动按钮 */}
        <button
          onClick={scrollLeft}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[var(--theme-background)]/90 hover:bg-[var(--theme-background)] backdrop-blur-md text-[var(--theme-text)] rounded-full flex items-center justify-center shadow-xl shadow-black/30 transition-all duration-300 hover:scale-110 ${showButtons ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}
          aria-label="向左滚动"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 滚动容器 */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-3 md:space-x-4 p-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onWheel={handleWheel}
        >
          {displayMovies.map((movie) => (
            <div key={movie.id} className="shrink-0 w-36 sm:w-44 md:w-52">
              <DoubanCard movie={movie} onSelect={onMovieClick} />
            </div>
          ))}
        </div>

        {/* 右侧滚动按钮 */}
        <button
          onClick={scrollRight}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[var(--theme-background)]/90 hover:bg-[var(--theme-background)] backdrop-blur-md text-[var(--theme-text)] rounded-full flex items-center justify-center shadow-xl shadow-black/30 transition-all duration-300 hover:scale-110 ${showButtons ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}
          aria-label="向右滚动"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
