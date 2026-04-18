// 模拟不同视频源的数据差异

import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('=== 分析不同视频源的数据格式差异 ===\n');

// 模拟不同源返回的数据
const sources = {
  '如意资源站': 'https://cj.rycjapi.com/api.php/provide/vod',
  '其他源1': 'https://other1.com/api',
  '其他源2': 'https://other2.com/api'
};

// 模拟各源返回的数据
const mockDataFromDifferentSources = [
  {
    source: '如意资源站',
    // 如意资源站可能返回的格式
    titles: [
      '流浪地球2 HD高清正片',
      '满江红 高清完整版',
      '长津湖 中文字幕全集'
    ]
  },
  {
    source: '其他源1',
    // 某些源返回的格式（更干净）
    titles: [
      '流浪地球2',  // 干净的！
      '满江红',     // 干净的！
      '长津湖'     // 干净的！
    ]
  },
  {
    source: '其他源2',
    // 某些源返回的格式（更复杂）
    titles: [
      '流浪地球2 蓝光高清中字1080p',
      '满江红-高清版-正片-已完结',
      '长津湖 【HD超清】中文字幕'
    ]
  }
];

console.log('模拟不同源的数据：\n');

mockDataFromDifferentSources.forEach(group => {
  console.log(`【${group.source}】`);
  group.titles.forEach((title, i) => {
    const cleaned = cleanTitleFromLabels(title);
    console.log(`  ${i + 1}. 原始: "${title}"`);
    console.log(`     清理: "${cleaned}"`);
    console.log(`     状态: ${cleaned === title ? '⚠️ 原本干净' : '✅ 已清理'}`);
    console.log('');
  });
});

console.log('\n=== 关键发现 ===');
console.log('如意资源站返回的标题可能本身就包含了多余标签！');
console.log('其他某些源的标题可能本身就很干净！');
console.log('');

// 现在模拟分组逻辑
console.log('\n=== 模拟分组逻辑 ===');
const allResults = mockDataFromDifferentSources.flatMap(group =>
  group.titles.map(title => ({ name: title, source: group.source }))
);

console.log('\n所有结果（未分组）：');
allResults.forEach((item, i) => {
  console.log(`  ${i + 1}. [${item.source}] "${item.name}"`);
});

// 分组
const groups: Record<string, typeof allResults> = {};
allResults.forEach(result => {
  const cleanedKey = cleanTitleFromLabels(result.name);
  if (!groups[cleanedKey]) {
    groups[cleanedKey] = [];
  }
  groups[cleanedKey].push(result);
});

console.log('\n分组结果：');
Object.entries(groups).forEach(([key, items], i) => {
  console.log(`\n  分组 ${i + 1}: "${key}"`);
  console.log(`    包含 ${items.length} 个结果：`);
  items.forEach(item => {
    console.log(`      - [${item.source}] "${item.name}"`);
  });
});

console.log('\n=== 显示给DoubanCard的数据 ===');
Object.entries(groups).forEach(([cleanedTitle, items], i) => {
  const firstItem = items[0];
  console.log(`\n  卡片 ${i + 1}:`);
  console.log(`    显示标题: "${cleanedTitle}" (已清理)`);
  console.log(`    原始来源: "[${firstItem.source}] ${firstItem.name}"`);
  console.log(`    ✅ 显示的是清理后的标题，不是原始标题！`);
});
