"use client";

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useTransition,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Drama, VodSource } from "@/types/drama";
import DoubanCard from "@/components/DoubanCard";
import { useVodSources } from "@/hooks/useVodSources";
import { mutate } from "swr";
import { useSearchHistory } from "@/hooks/useSearchHistory";

// SWR 缓存键前缀
const SWR_SEARCH_KEY_PREFIX = "search-results-";

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-y-8 gap-x-4 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-2/3 bg-gray-800/50 rounded-lg w-full" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-800/50 rounded w-3/4" />
            <div className="h-3 bg-gray-800/50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKeyword = searchParams.get("q") || "";

  const [searchKeyword, setSearchKeyword] = useState(queryKeyword);
  const [searchResults, setSearchResults] = useState<Record<string, (Drama & { source: VodSource })[]>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const { history: searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // 使用 SWR 缓存的视频源配置
  const { sources: allSources } = useVodSources();
  const [currentSource, setCurrentSource] = useState<VodSource | null>(null);
  const [searchStats, setSearchStats] = useState<{
    total: number;
    bySource: Record<string, number>;
  }>({ total: 0, bySource: {} });

  // 流式搜索进度
  const [searchProgress, setSearchProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });

  // 使用 useTransition 让渲染不阻塞用户交互
  const [, startTransition] = useTransition();

  // 防止重复搜索
  const searchingRef = useRef<string | null>(null);

  // 同步 URL 参数到本地搜索框状态
  useEffect(() => {
    setSearchKeyword(queryKeyword);
  }, [queryKeyword]);

  // 执行流式搜索 - 每个源完成就立即显示结果
  const performSearch = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) return;

      setLoading(true);
      setSearched(true);
      setSearchResults({});
      setSearchStats({ total: 0, bySource: {} });
      setSearchProgress({ completed: 0, total: 0 });

      try {
        console.log(`🔍 开始流式搜索: ${keyword}`);

        // 使用流式搜索 API
        const response = await fetch(
          `/api/drama/search-stream?q=${encodeURIComponent(keyword.trim())}`
        );

        if (!response.ok) {
          throw new Error("搜索请求失败");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 数据
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // 保留未完成的部分

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "init") {
                  // 初始化：设置总源数（源列表来自 useVodSources hook）
                  console.log(`📡 开始搜索 ${data.totalSources} 个视频源`);
                  setSearchProgress({ completed: 0, total: data.totalSources });
                } else if (data.type === "result") {
                  // 收到单个源的结果 - 立即追加显示并分组
                  console.log(
                    `  ✅ ${data.sourceName} 找到 ${data.count} 个结果`
                  );

                  startTransition(() => {
                    // 合并新结果并分组
                    const mergedResults = [...(Object.values(prev).flat()), ...data.results];
                    const groupedResults = mergedResults.reduce((groups, result) => {
                      // 使用影片名称作为分组键，去除首尾空格
                      const key = result.name.trim();
                      if (!groups[key]) {
                        groups[key] = [];
                      }
                      // 检查是否已经添加了相同源的相同影片
                      const existingIndex = groups[key].findIndex(
                        item => item.source.key === result.source.key && item.id === result.id
                      );
                      if (existingIndex === -1) {
                        groups[key].push(result);
                      }
                      return groups;
                    }, {} as Record<string, (Drama & { source: VodSource })[]>);
                    
                    setSearchResults(groupedResults);
                    setSearchStats((prev) => ({
                      total: Object.values(groupedResults).length,
                      bySource: {
                        ...prev.bySource,
                        [data.sourceKey]: data.count,
                      },
                    }));
                  });

                  setSearchProgress((prev) => ({
                    ...prev,
                    completed: prev.completed + 1,
                  }));
                } else if (data.type === "done") {
                  console.log("📊 所有视频源搜索完成");

                  // 搜索完成后，使用 SWR mutate 缓存结果
                  setSearchResults((currentResults) => {
                    setSearchStats((currentStats) => {
                      // 缓存到 SWR
                      mutate(
                        `${SWR_SEARCH_KEY_PREFIX}${keyword}`,
                        {
                          results: currentResults,
                          stats: currentStats,
                        },
                        false
                      );
                      return currentStats;
                    });
                    return currentResults;
                  });
                }
              } catch (e) {
                console.error("解析 SSE 数据失败:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("搜索失败:", error);
        // 检查是否是因为没有配置视频源
        if (allSources.length === 0) {
          // 会在 UI 中显示配置提示
        }
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [startTransition]
  );

  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setShowSuggestions(true);
    
    // 生成搜索建议（基于搜索历史和输入值）
    if (value.trim()) {
      const suggestions = searchHistory
        .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  // 当搜索关键词变化时执行搜索
  useEffect(() => {
    if (queryKeyword && searchingRef.current !== queryKeyword) {
      searchingRef.current = queryKeyword;
      performSearch(queryKeyword);
    }
  }, [queryKeyword, performSearch]);

  // 处理搜索提交
  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    addToHistory(searchKeyword.trim());
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  // 点击影片 - 清除旧缓存后跳转播放页面
  const handlePlayClick = (drama: Drama & { source: VodSource }) => {
    // 清除旧的 multi_source_matches 缓存，避免 SourceSelector 显示旧数据
    try {
      localStorage.removeItem("multi_source_matches");
    } catch {
      // 静默处理
    }

    router.push(`/play/${drama.id}?source=${drama.source.key}`);
  };

  // 返回首页
  const goBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-text)] selection:bg-[var(--theme-primary)]/30">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-[var(--theme-background)]/95 backdrop-blur-xl border-b border-[var(--theme-border)] shadow-2xl shadow-black/50">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* 返回按钮和Logo */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-[var(--theme-hover)] transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-[var(--theme-textSecondary)] group-hover:text-[var(--theme-text)] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1
                className="text-xl font-bold tracking-tight cursor-pointer hidden sm:block"
                onClick={goBack}
              >
                <span className="text-[var(--theme-primary)]">光影流年</span>
                <span className="text-[var(--theme-text)] ml-1">搜索</span>
              </h1>
            </div>
            {/* 搜索框 */}
            <div className="flex-1 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="搜索电影、电视剧、动漫..."
                  className="w-full bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-full py-2.5 pl-12 pr-12 text-sm md:text-base text-[var(--theme-text)] placeholder-[var(--theme-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]/50 focus:bg-[var(--theme-surface)] transition-all"
                  autoFocus
                />
                
                {/* 搜索建议和历史 */}
                {showSuggestions && (searchKeyword || searchHistory.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg shadow-xl z-50">
                    {/* 搜索历史 */}
                    {searchHistory.length > 0 && !searchKeyword && (
                      <div className="p-4 border-b border-[var(--theme-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-[var(--theme-text)]">搜索历史</h3>
                          <button
                            onClick={clearHistory}
                            className="text-xs text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]"
                          >
                            清除
                          </button>
                        </div>
                        <div className="space-y-2">
                          {searchHistory.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-[var(--theme-hover)] rounded cursor-pointer"
                              onClick={() => {
                                setSearchKeyword(item);
                                handleSearch();
                              }}
                            >
                              <span className="text-sm text-[var(--theme-text)]">{item}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromHistory(item);
                                }}
                                className="text-xs text-[var(--theme-textSecondary)] hover:text-[var(--theme-error)]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 搜索建议 */}
                    {searchSuggestions.length > 0 && searchKeyword && (
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-[var(--theme-text)] mb-2">搜索建议</h3>
                        <div className="space-y-2">
                          {searchSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-[var(--theme-hover)] rounded cursor-pointer"
                              onClick={() => {
                                setSearchKeyword(suggestion);
                                handleSearch();
                              }}
                            >
                              <span className="text-sm text-[var(--theme-text)]">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute inset-y-0 right-14 pr-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500 hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-1.5 my-1.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-red-900/20"
                >
                  搜索
                </button>
              </div>
            </div>
            <div className="w-10 sm:w-[88px] shrink-0" />{" "}
            {/* Spacer for alignment */}
          </div>

          {/* 视频源筛选器 - 只有在有结果或有源时显示 */}
          {allSources.length > 0 && (
            <div className="mt-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max pb-1">
                <button
                  onClick={() => setCurrentSource(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    currentSource === null
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
                  }`}
                >
                  全部
                  <span className="ml-1.5 opacity-60">
                    {Object.keys(searchResults).length}
                  </span>
                </button>
                {allSources.map((source) => {
                  const count = searchStats.bySource[source.key] || 0;
                  if (count === 0 && searched && !loading) return null; // 搜索完成且无结果的源隐藏? 不，还是显示好，或者变灰

                  return (
                    <button
                      key={source.key}
                      onClick={() => setCurrentSource(source)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                        currentSource?.key === source.key
                          ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
                      }`}
                    >
                      {source.name}
                      {count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            currentSource?.key === source.key
                              ? "bg-white/20 text-white"
                              : "bg-white/10 text-gray-500"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
        {/* 状态反馈条 */}
        {(loading || searched) && (
          <div className="mb-8 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              {loading ? (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  正在从 {searchProgress.total} 个源中搜索...
                  <span className="ml-2 px-2 py-0.5 bg-white/5 rounded-md text-xs">
                    已完成 {searchProgress.completed}/{searchProgress.total}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white font-medium">
                    {searchResults.length}
                  </span>{" "}
                  个结果
                  {queryKeyword && (
                    <>
                      · 关键词{" "}
                      <span className="text-white font-medium">
                        &ldquo;{queryKeyword}&rdquo;
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {allSources.length === 0 ? (
          // 无视频源配置
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">未配置视频源</h3>
            <p className="text-gray-400 mb-8 max-w-sm text-center">
              请先在后台管理中配置视频源后再使用搜索功能
            </p>
            <a
              href="/admin/settings"
              className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              前往配置
            </a>
          </div>
        ) : loading && Object.keys(searchResults).length === 0 ? (
          // 初始加载中 (Skeleton)
          <SearchSkeleton />
        ) : searched || Object.keys(searchResults).length > 0 ? (
          Object.keys(searchResults).length > 0 ? (
            <div className="animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-y-8 gap-x-4">
                {Object.entries(searchResults)
                  .map(([title, group]) => {
                    // 过滤当前源的结果
                    const filteredGroup = group.filter(
                      (drama) => !currentSource || drama.source.key === currentSource.key
                    );
                    
                    // 如果过滤后没有结果，跳过
                    if (filteredGroup.length === 0) return null;
                    
                    const firstDrama = filteredGroup[0];
                    const movieData = {
                      id: String(firstDrama.id),
                      title: firstDrama.name,
                      cover: firstDrama.pic,
                      rate: firstDrama.score || "",
                      episode_info: firstDrama.remarks || firstDrama.note || "",
                      is_new: false,
                      playable: true,
                      url: "",
                      cover_x: 0,
                      cover_y: 0,
                    };

                    return (
                      <div
                        key={title}
                        className="relative group z-0 hover:z-50"
                      >
                        {/* 源数量标识 */}
                        <div className="absolute bottom-2 right-2 z-40">
                          <div className="relative">
                            <div className="bg-[var(--theme-primary)] text-[var(--theme-text)] text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              {filteredGroup.length}
                            </div>
                            {/* 悬停提示 */}
                            <div className="absolute bottom-full right-0 mb-2 bg-[var(--theme-background)]/90 backdrop-blur-md text-[var(--theme-text)] text-xs p-2 rounded-md shadow-xl w-48 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-[var(--theme-border)]">
                              <div className="font-medium mb-1">可用源：</div>
                              <div className="space-y-1">
                                {filteredGroup.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span>{item.source.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DoubanCard
                          movie={movieData}
                          onSelect={() => {
                            // 如果只有一个源，直接播放
                            if (filteredGroup.length === 1) {
                              handlePlayClick(filteredGroup[0]);
                            } else {
                              // 这里可以添加源选择逻辑
                              // 暂时使用第一个源
                              handlePlayClick(filteredGroup[0]);
                            }
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* 无结果 */
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                未找到相关内容
              </h3>
              <p className="text-gray-400 mb-2">
                在所有 {allSources.length} 个视频源中搜索 &ldquo;{queryKeyword}
                &rdquo; 没有结果
              </p>
              <p className="text-gray-500 text-sm mb-6">
                已搜索: {allSources.map((s) => s.name).join("、")}
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBack}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  返回首页
                </button>
                <button
                  onClick={() => setSearchKeyword("")}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  重新搜索
                </button>
              </div>
            </div>
          )
        ) : (
          /* 初始状态 */
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">搜索影视资源</h3>
            <p className="text-gray-400 mb-2">
              输入关键词，将在 {allSources.length} 个视频源中搜索
            </p>
            <p className="text-gray-500 text-sm">
              {allSources.map((s) => s.name).join("、")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-red-600 mx-auto mb-4" />
            <p className="text-gray-300 text-lg font-medium">加载中...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
