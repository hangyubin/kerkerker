import useSWR from 'swr';
import type { VodSource } from '@/types/drama';

interface VodSourcesResponse {
  sources: VodSource[];
  selected: VodSource | null;
}

// 获取 VOD 视频源配置
async function fetchVodSources(): Promise<VodSourcesResponse> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 使用AbortController实现超时功能
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch('/api/vod-sources', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        return {
          sources: result.data.sources || [],
          selected: result.data.selected || null,
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        console.error('All attempts failed, returning empty sources');
        return { sources: [], selected: null };
      }
    }
  }
  
  return { sources: [], selected: null };
}

interface UseVodSourcesReturn {
  sources: VodSource[];
  selected: VodSource | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 管理 VOD 视频源配置
 * 使用 SWR 缓存配置数据
 */
export function useVodSources(): UseVodSourcesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'vod-sources',
    fetchVodSources
  );

  return {
    sources: data?.sources || [],
    selected: data?.selected || null,
    loading: isLoading && !data,
    error: error?.message || null,
    refetch: async () => { await mutate(); },
  };
}
