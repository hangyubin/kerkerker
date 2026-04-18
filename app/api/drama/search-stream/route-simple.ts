/**
 * 简化版 search-stream/route.ts
 * 参考NewTV的做法，直接使用API返回的原始数据
 */

import { NextRequest } from 'next/server';
import { getVodSourcesFromDB } from '@/lib/vod-sources-db';
import { VodSource } from '@/types/drama';

interface DramaListItem {
  vod_id?: number;
  vod_name?: string;
  vod_pic?: string;
  vod_remarks?: string;
  type_name?: string;
  id?: number;
  name?: string;
  pic?: string;
  remarks?: string;
  type?: string;
}

interface DramaListResponse {
  code: number;
  msg: string;
  list: DramaListItem[];
}

interface ProxySearchResponse {
  success: boolean;
  message: string;
  data: DramaListItem[];
}

function isProxyResponse(data: unknown): data is ProxySearchResponse {
  return typeof data === 'object' && data !== null && 'success' in data && 'data' in data;
}

function isStandardResponse(data: unknown): data is DramaListResponse {
  return typeof data === 'object' && data !== null && 'code' in data && 'list' in data;
}

// 参考NewTV的做法 - 只做简单的trim，不做任何清理
function formatDramaList(list: DramaListItem[], source: VodSource) {
  return list.map((item) => {
    // 参考NewTV: item.vod_name.trim().replace(/\s+/g, ' ')
    const rawName = item.vod_name || item.name || '';
    const title = rawName.trim().replace(/\s+/g, ' ');

    return {
      id: item.vod_id || item.id || 0,
      name: title,
      originalName: rawName,
      pic: item.vod_pic || item.pic || '',
      remarks: item.vod_remarks || item.remarks || '',
      type: item.type_name || item.type || '影视',
      source: source,
    };
  });
}

async function searchSingleSource(source: VodSource, keyword: string) {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let response: Response;

      if (source.searchProxy) {
        response = await fetch(source.searchProxy, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api: source.api, keyword, page: 1 }),
          signal: AbortSignal.timeout(15000),
        });
      } else {
        // 参考NewTV: 使用 videolist 接口
        const apiParams = new URLSearchParams({ ac: 'videolist', pg: '1', wd: keyword });
        const apiUrl = `${source.api}?${apiParams.toString()}`;

        response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000),
        });
      }

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: unknown = await response.json();

      if (source.searchProxy && isProxyResponse(data)) {
        if (!data.success) {
          return { source, results: [], error: data.message || '搜索失败' };
        }
        return { source, results: formatDramaList(data.data || [], source), error: null };
      }

      if (isStandardResponse(data)) {
        if (data.code !== 1) {
          return { source, results: [], error: data.msg || '未知错误' };
        }
        return { source, results: formatDramaList(data.list || [], source), error: null };
      }

      return { source, results: [], error: '无法解析响应格式' };
    } catch (error) {
      console.error(`Source ${source.name} (attempt ${attempt}) failed:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        return { source, results: [], error: error instanceof Error ? error.message : '搜索失败' };
      }
    }
  }

  return { source, results: [], error: '搜索失败' };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('q');

  if (!keyword) {
    return new Response(JSON.stringify({ error: '缺少搜索关键词' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const allSources = await getVodSourcesFromDB();

  if (allSources.length === 0) {
    return new Response(JSON.stringify({ error: '未配置视频源' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'init', totalSources: allSources.length })}\n\n`
      ));

      const searchPromises = allSources.map(async (source) => {
        const result = await searchSingleSource(source, keyword);

        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({
            type: 'result',
            sourceKey: source.key,
            sourceName: source.name,
            count: result.results.length,
            results: result.results,
            error: result.error,
          })}\n\n`
        ));

        return result;
      });

      await Promise.all(searchPromises);

      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'done' })}\n\n`
      ));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
