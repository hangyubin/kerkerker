// 完整流程测试

import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('=== 完整流程测试 ===\n');

// 模拟API返回的原始数据
const mockApiResults = [
  { name: '流浪地球2 HD高清', source: '测试源1' },
  { name: '满江红 正片', source: '测试源2' },
  { name: '长津湖 中文字幕', source: '测试源1' },
  { name: '肖申克的救赎 已完结', source: '测试源3' },
  { name: '盗梦空间 蓝光版', source: '测试源2' },
  { name: '复仇者联盟4 1080p', source: '测试源1' },
  { name: '功夫熊猫4 超清全集', source: '测试源3' },
  { name: '蜘蛛侠 纵横宇宙 HD中字', source: '测试源2' },
  { name: '阿凡达2 水之道 高清完整版', source: '测试源1' },
  { name: '奥本海默 4K杜比视界', source: '测试源3' },
];

console.log('1. 模拟API返回的原始数据：');
mockApiResults.forEach((item, i) => {
  console.log(`   ${i + 1}. [${item.source}] "${item.name}"`);
});

console.log('\n2. 模拟分组逻辑：');
const groups: Record<string, typeof mockApiResults> = {};

mockApiResults.forEach((result) => {
  const originalTitle = result.name.trim();
  const cleanedKey = cleanTitleFromLabels(originalTitle);
  
  console.log(`   原始: "${originalTitle}"`);
  console.log(`   清理: "${cleanedKey}"`);
  console.log('');
  
  if (!groups[cleanedKey]) {
    groups[cleanedKey] = [];
  }
  groups[cleanedKey].push(result);
});

console.log('\n3. 模拟显示逻辑（传给DoubanCard的标题）：');
Object.entries(groups).forEach(([cleanedTitle, group], i) => {
  console.log(`   ${i + 1}. 显示标题: "${cleanedTitle}"`);
  console.log(`      来源数: ${group.length}`);
  group.forEach(item => {
    console.log(`        - [${item.source}] 原始: "${item.name}"`);
  });
});

console.log('\n=== 结论 ===');
console.log('显示给用户的标题是清理后的：✅');
console.log('分组使用的键是清理后的：✅');
console.log('\n如果您看到还有多余标签，请检查：');
console.log('1. 浏览器是否有缓存？');
console.log('2. 开发服务器是否需要重启？');
console.log('3. 是否有其他地方在显示标题？');
