/**
 * 本地测试 - 模拟API处理流程
 *
 * 运行方式：
 * npx tsx test-api-simulation.ts
 */

import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('=== API处理流程模拟测试 ===\n');

// 模拟不同接口返回的数据格式
const mockDataFormats = {
  // detail接口格式
  detail: {
    vod_id: 1,
    vod_name: '流浪地球2 HD高清正片',
    vod_pic: 'https://example.com/pic.jpg',
    vod_remarks: 'HD高清'
  },

  // videolist接口格式
  videolist: {
    id: 2,
    name: '满江红 高清完整版',
    pic: 'https://example.com/pic.jpg',
    remarks: '高清完整版'
  },

  // 某些代理可能返回的格式
  proxy: {
    vod_id: 3,
    vod_name: '长津湖 中文字幕全集',
    vod_pic: 'https://example.com/pic.jpg',
    vod_remarks: '中文字幕'
  }
};

console.log('1. 模拟 detail 接口数据处理:');
const detailItem = mockDataFormats.detail;
console.log(`   原始数据: vod_name = "${detailItem.vod_name}"`);
console.log(`   处理逻辑: name = cleanTitleFromLabels(item.vod_name || item.name || '')`);
const detailResult = cleanTitleFromLabels(detailItem.vod_name || detailItem.name || '');
console.log(`   处理结果: "${detailResult}"`);
console.log(`   状态: ${detailResult === '流浪地球2' ? '✅ 正确' : '❌ 错误'}\n`);

console.log('2. 模拟 videolist 接口数据处理:');
const videolistItem = mockDataFormats.videolist;
console.log(`   原始数据: name = "${videolistItem.name}"`);
console.log(`   处理逻辑: name = cleanTitleFromLabels(item.vod_name || item.name || '')`);
const videolistResult = cleanTitleFromLabels(videolistItem.vod_name || videolistItem.name || '');
console.log(`   处理结果: "${videolistResult}"`);
console.log(`   状态: ${videolistResult === '满江红' ? '✅ 正确' : '❌ 错误'}\n`);

console.log('3. 模拟代理接口数据处理:');
const proxyItem = mockDataFormats.proxy;
console.log(`   原始数据: vod_name = "${proxyItem.vod_name}"`);
console.log(`   处理逻辑: name = cleanTitleFromLabels(item.vod_name || item.name || '')`);
const proxyResult = cleanTitleFromLabels(proxyItem.vod_name || proxyItem.name || '');
console.log(`   处理结果: "${proxyResult}"`);
console.log(`   状态: ${proxyResult === '长津湖' ? '✅ 正确' : '❌ 错误'}\n`);

console.log('=== 边缘情况测试 ===\n');

// 测试空数据
console.log('4. 空数据处理:');
console.log(`   empty string: "${cleanTitleFromLabels('')}"`);
console.log(`   undefined: "${cleanTitleFromLabels(undefined as any)}"`);
console.log(`   null: "${cleanTitleFromLabels(null as any)}"`);

console.log('\n=== 测试结论 ===');
console.log('如果所有测试都显示 ✅，说明处理逻辑是正确的');
console.log('问题可能在于：');
console.log('1. API返回的原始数据格式不符合预期');
console.log('2. 浏览器缓存了旧数据');
console.log('3. 代码没有被正确部署');
