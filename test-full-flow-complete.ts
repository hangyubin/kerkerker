// 完整流程测试 - 模拟API响应到前端显示的全过程

import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('=== 完整流程测试 ===\n');

// 1. 模拟API返回的原始数据
const apiRawData = [
  {
    vod_id: 1,
    vod_name: '流浪地球2 HD高清正片',
    vod_pic: 'https://example.com/pic1.jpg',
    vod_remarks: 'HD高清',
    type_name: '电影'
  }
];

console.log('1. API返回的原始数据：');
console.log(JSON.stringify(apiRawData, null, 2));
console.log('');

// 2. 模拟API层面的formatDramaList处理
function formatDramaList(list: any[], source: any) {
  return list.map((item) => ({
    id: item.vod_id,
    name: cleanTitleFromLabels(item.vod_name), // API层面清理
    originalName: item.vod_name,
    subName: item.vod_sub || '',
    pic: item.vod_pic || '',
    remarks: item.vod_remarks || '',
    type: item.type_name || '影视',
    source: source,
  }));
}

const apiResults = formatDramaList(apiRawData, { key: 'rycjapi', name: '如意资源站' });
console.log('2. API层面处理后（formatDramaList）：');
console.log(JSON.stringify(apiResults, null, 2));
console.log('');

// 3. 模拟前端搜索页面处理
console.log('3. 前端搜索页面处理：');

const filteredResults = apiResults.filter((result: any) => {
  const name = result.name.toLowerCase();
  return !name.includes('解说') && !name.includes('讲解') && !name.includes('解析');
});

const mergedResults = [...filteredResults];

const groupedResults: Record<string, any[]> = mergedResults.reduce((groups, result) => {
  const originalTitle = result.name.trim();
  const cleanedKey = cleanTitleFromLabels(originalTitle);
  
  console.log(`   前端清理: "${originalTitle}" => "${cleanedKey}"`);
  
  if (!groups[cleanedKey]) {
    groups[cleanedKey] = [];
  }
  groups[cleanedKey].push(result);
  return groups;
}, {} as Record<string, any[]>);

console.log('');
console.log('4. 分组结果：');
console.log(JSON.stringify(groupedResults, null, 2));
console.log('');

// 4. 模拟显示逻辑
console.log('5. 显示给用户的标题：');
Object.entries(groupedResults).forEach(([cleanedTitle, group]) => {
  console.log(`   卡片标题: "${cleanedTitle}"`);
  console.log(`   来源: ${group[0].source.name}`);
});

console.log('\n=== 结论 ===');
console.log('如果仍然显示多余标签，可能的原因：');
console.log('1. 浏览器缓存了旧的API响应');
console.log('2. 开发服务器没有重启');
console.log('3. 搜索代理返回的是未清理的标题');
console.log('4. 前端缓存（localStorage）存储了旧数据');
console.log('');
console.log('解决方案：');
console.log('1. 硬刷新浏览器：Ctrl+Shift+R');
console.log('2. 重启开发服务器');
console.log('3. 清除浏览器缓存和localStorage');
console.log('4. 检查搜索代理配置');
