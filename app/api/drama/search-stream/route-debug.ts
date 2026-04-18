/**
 * 添加调试日志的 search-stream/route.ts
 *
 * 使用方法：
 * 1. 替换 app/api/drama/search-stream/route.ts
 * 2. 重启 Docker 容器
 * 3. 查看容器日志
 */

import { NextRequest } from 'next/server';
import { getVodSourcesFromDB } from '@/lib/vod-sources-db';
import { VodSource } from '@/types/drama';
import { cleanTitleFromLabels } from '@/lib/utils/title-utils';

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

function formatDramaList(list: DramaListItem[], source: VodSource) {
  // 调试：打印原始数据示例
  if (list.length > 0) {
    const firstItem = list[0];
    console.log(`[DEBUG] ${source.name} API原始数据示例:`, JSON.stringify(firstItem));
    console.log(`[DEBUG] 原始vod_name: "${firstItem.vod_name || firstItem.name || 'undefined'}"`);
  }

  const formatted = list.map((item) => {
    const rawName = item.vod_name || item.name || '';
    const cleanedName = cleanTitleFromLabels(rawName);

    // 调试：如果名称发生变化，打印日志
    if (rawName !== cleanedName) {
      console.log(`[DEBUG] 清理标题: "${rawName}" => "${cleanedName}"`);
    }

    return {
      id: item.vod_id || item.id || 0,
      name: cleanedName,
      originalName: rawName,
      pic: item.vod_pic || item.pic || '',
      remarks: item.vod_remarks || item.remarks || '',
      source: source,
    };
  });

  // 调试：打印处理后的数据示例
  if (formatted.length > 0) {
    console.log(`[DEBUG] ${source.name} 处理后数据示例:`, JSON.stringify(formatted[0]));
  }

  return formatted;
}

async function searchSingleSource(source: VodSource, keyword: string) {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let response: Response;

      console.log(`[DEBUG] ${source.name} 请求API (attempt ${attempt})...`);

      if (source.searchProxy) {
        response = await fetch(source.searchProxy, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api: source.api, keyword, page: 1 }),
          signal: AbortSignal.timeout(15000),
        });
      } else {
        const apiParams = new URLSearchParams({ ac: 'videolist', pg: '1', wd: keyword });
        const apiUrl = `${source.api}?${apiParams.toString()}`;
        console.log(`[DEBUG] ${source.name} 请求URL: ${apiUrl}`);

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

      // 调试：打印API响应状态
      if (source.searchProxy && isProxyResponse(data)) {
        console.log(`[DEBUG] ${source.name} 代理响应: success=${data.success}, data.length=${data.data?.length || 0}`);
        if (!data.success) {
          console.log(`[DEBUG] ${source.name} 代理错误: ${data.message}`);
        }
        return { source, results: formatDramaList(data.data || [], source), error: data.success ? null : data.message };
      }

      if (isStandardResponse(data)) {
        console.log(`[DEBUG] ${source.name} 标准响应: code=${data.code}, list.length=${data.list?.length || 0}`);
        if (data.code !== 1) {
          return { source, results: [], error: data.msg || '未知错误' };
        }
        return { source, results: formatDramaList(data.list || [], source), error: null };
      }

      console.log(`[DEBUG] ${source.name} 无法解析响应格式`);
      return { source, results: [], error: '无法解析响应格式' };
    } catch (error) {
      console.error(`[DEBUG] ${source.name} (attempt ${attempt}) 失败:`, error);
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

  console.log(`[DEBUG] 搜索请求: keyword="${keyword}"`);

  if (!keyword) {
    return new Response(JSON.stringify({ error: '缺少搜索关键词' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const allSources = await getVodSourcesFromDB();
  console.log(`[DEBUG] 找到 ${allSources.length} 个视频源`);

  if (allSources.length === 0) {
    return new Response(JSON.stringify({ error: '未配置视频源' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', totalSources: allSources.length })}\n\n`));

      const searchPromises = allSources.map(async (source) => {
        const result = await searchSingleSource(source, keyword);
        console.log(`[DEBUG] ${source.name} 搜索完成: ${result.results.length} 个结果, error=${result.error}`);

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
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
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
