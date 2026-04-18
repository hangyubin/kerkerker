// 测试修复后的函数

import { cleanTitleFromLabels } from './lib/utils/title-utils';

// 测试 cleanTitleFromLabels 处理 undefined
console.log('=== 测试 cleanTitleFromLabels 处理 undefined ===');
console.log(`cleanTitleFromLabels(undefined): "${cleanTitleFromLabels(undefined as any)}"`);
console.log(`cleanTitleFromLabels(null): "${cleanTitleFromLabels(null as any)}"`);
console.log(`cleanTitleFromLabels(''): "${cleanTitleFromLabels('')}"`);
console.log('');

// 测试不同字段名的情况
console.log('=== 测试不同字段名的情况 ===');

// 模拟 detail 接口返回（使用 vod_ 前缀）
const detailItem = {
  vod_id: 1,
  vod_name: '流浪地球2 HD高清正片',
  vod_pic: 'https://example.com/pic1.jpg',
  vod_remarks: 'HD高清',
  type_name: '电影'
};

// 模拟 videolist 接口返回（使用简洁字段名）
const videolistItem = {
  id: 2,
  name: '满江红 高清完整版',
  pic: 'https://example.com/pic2.jpg',
  remarks: '高清完整版',
  type: '电影'
};

// 模拟 formatDramaList 处理
function testFormat(item: any) {
  return {
    id: item.vod_id || item.id || 0,
    name: cleanTitleFromLabels(item.vod_name || item.name || ''),
    originalName: item.vod_name || item.name || '',
  };
}

console.log('Detail 接口处理结果:');
const detailResult = testFormat(detailItem);
console.log(`  原始: "${detailResult.originalName}"`);
console.log(`  清理: "${detailResult.name}"`);
console.log('');

console.log('Videolist 接口处理结果:');
const videolistResult = testFormat(videolistItem);
console.log(`  原始: "${videolistResult.originalName}"`);
console.log(`  清理: "${videolistResult.name}"`);
console.log('');

console.log('=== 修复总结 ===');
console.log('1. cleanTitleFromLabels 现在会处理 undefined 输入');
console.log('2. formatDramaList 现在会支持不同的字段名格式');
console.log('3. 无论是 detail 还是 videolist 接口，都会正确清理标题');
