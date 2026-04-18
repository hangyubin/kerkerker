// 完整数据流追踪

import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('=== 完整数据流追踪 ===\n');

// 模拟API返回的原始数据（来自不同源）
const apiRawData = [
  // 来自如意资源站（标题包含多余标签）
  { id: 1, name: '流浪地球2 HD高清正片', source: '如意资源站', remarks: 'HD高清' },
  { id: 2, name: '满江红 高清完整版', source: '如意资源站', remarks: '高清完整版' },
  { id: 3, name: '长津湖 中文字幕全集', source: '如意资源站', remarks: '中文字幕' },

  // 来自其他源（标题本身很干净）
  { id: 4, name: '流浪地球2', source: '其他源1', remarks: '' },
  { id: 5, name: '满江红', source: '其他源1', remarks: '' },
  { id: 6, name: '长津湖', source: '其他源1', remarks: '' },

  // 又来自如意资源站（标题包含多余标签）
  { id: 7, name: '蜘蛛侠 纵横宇宙 HD中字', source: '如意资源站', remarks: 'HD中字' },
  { id: 8, name: '阿凡达2 水之道 4K蓝光', source: '如意资源站', remarks: '4K蓝光' },
];

console.log('【第1步：API返回的原始数据】');
apiRawData.forEach((item, i) => {
  console.log(`  ${i + 1}. [${item.source}] id=${item.id}, name="${item.name}", remarks="${item.remarks}"`);
});

// 模拟搜索页面的过滤和分组逻辑
console.log('\n【第2步：过滤解说内容】');
const filtered = apiRawData.filter(item => {
  const name = item.name.toLowerCase();
  return !name.includes('解说') && !name.includes('讲解') && !name.includes('解析');
});
console.log(`  过滤后剩余: ${filtered.length} 个`);

// 模拟分组逻辑
console.log('\n【第3步：分组逻辑】');
const grouped: Record<string, typeof filtered> = {};
filtered.forEach(result => {
  const originalTitle = result.name.trim();
  const cleanedKey = cleanTitleFromLabels(originalTitle);

  if (originalTitle !== cleanedKey) {
    console.log(`  清理: "${originalTitle}" => "${cleanedKey}"`);
  }

  if (!grouped[cleanedKey]) {
    grouped[cleanedKey] = [];
  }
  grouped[cleanedKey].push(result);
});

console.log('\n【第4步：显示给DoubanCard的数据】');
Object.entries(grouped).forEach(([cleanedTitle, items], i) => {
  const firstItem = items[0];

  // 模拟构建movieData
  const movieData = {
    id: String(firstItem.id),
    title: cleanedTitle,  // 使用清理后的标题！
    cover: '/placeholder.jpg',
    rate: '',
    episode_info: firstItem.remarks || '',
    is_new: false,
    playable: true,
    url: '',
    cover_x: 0,
    cover_y: 0,
  };

  console.log(`\n  卡片 ${i + 1}:`);
  console.log(`    分组键: "${cleanedTitle}"`);
  console.log(`    DoubanCard接收的movie.title: "${movieData.title}"`);
  console.log(`    状态: ${cleanedTitle === movieData.title ? '✅ 一致' : '❌ 不一致'}`);
  console.log(`    该分组包含 ${items.length} 个结果:`);
  items.forEach(item => {
    console.log(`      - [${item.source}] "${item.name}"`);
  });
});

console.log('\n【结论】');
console.log('如果显示正确，movie.title应该是清理后的标题，');
console.log('而不是原始的包含多余标签的标题。');
