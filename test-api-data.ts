// 测试API返回的数据
// 我们直接模拟一下常见的API返回格式

console.log('=== 分析API返回数据格式 ===\n');

// 模拟常见的API返回标题格式
const mockApiTitles = [
  '流浪地球2 HD高清',
  '满江红 正片',
  '长津湖 中文字幕',
  '肖申克的救赎 已完结',
  '盗梦空间 蓝光版',
  '复仇者联盟4 1080p',
  '功夫熊猫4 超清全集',
  '蜘蛛侠 纵横宇宙 HD中字',
  '阿凡达2 水之道 高清完整版',
  '奥本海默 4K杜比视界',
];

console.log('常见的API返回标题：');
mockApiTitles.forEach((title, i) => {
  console.log(`${i + 1}. "${title}"`);
});

console.log('\n=== 现在分析我们的清理函数 ===\n');

// 复制我们的清理函数来测试
function testCleanTitleFromLabels(title: string): string {
  if (!title) return title;

  let cleaned = title;

  // 首先移除所有括号和方括号中的内容
  cleaned = cleaned
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/【.*?】/g, '')
    .replace(/（.*?）/g, '');

  const labelsToRemove = [
    '高清资源', '超清资源', '蓝光资源', '高清电影', '超清电影', '蓝光电影',
    '高清版', '超清版', '蓝光版', 'BD版', 'DVD版', '高清画质', '超清画质', '蓝光画质',
    'Full HD', 'HD Quality', 'Blu-ray',
    '高清', 'HD', '1080p', '720p', '4K', '超清', '标清', '蓝光', 'BD', 'DVD',
    '未删减版', '未删节', '完整版无删减', '正片版', '正式版', '完结版', '最终版', '电影版',
    '正片', '完整版', '原版', '修复版', '重制版', '全版',
    '中文字幕', '英文字幕', '日文字幕', '字幕版', '双语字幕',
    '中文字', '中字', '字幕', '国语版', '粤语版', '英语版', '日语版', '韩语版',
    '国语', '粤语', '英语', '日语', '韩语', '中文', '双语',
    '已完结', '完结', '更新至', '更新', '连载中', '完结篇',
    '在线观看', '免费观看', '观看', '全集', '完整版',
    '无删减', '未删减', '未删节', '未删减版',
    '高清完整版', '超清完整版', '蓝光完整版', 'HD版', '1080p版', '720p版', '4K版',
    '高清正片', '超清正片', '蓝光正片', 'HD正片', '1080p正片', '720p正片', '4K正片',
    '高清中字', '超清中字', '蓝光中字', 'HD中字', '1080p中字', '720p中字', '4K中字',
    '高清字幕', '超清字幕', '蓝光字幕', 'HD字幕', '1080p字幕', '720p字幕', '4K字幕',
    '高清全集', '超清全集', '蓝光全集', 'HD全集', '1080p全集', '720p全集', '4K全集',
    '高清完结', '超清完结', '蓝光完结', 'HD完结', '1080p完结', '720p完结', '4K完结',
    '完整版高清', '完整版超清', '完整版蓝光', '完整版HD', '完整版1080p', '完整版720p', '完整版4K',
    '正片高清', '正片超清', '正片蓝光', '正片HD', '正片1080p', '正片720p', '正片4K',
    '中字高清', '中字超清', '中字蓝光', '中字HD', '中字1080p', '中字720p', '中字4K',
    '字幕高清', '字幕超清', '字幕蓝光', '字幕HD', '字幕1080p', '字幕720p', '字幕4K',
    '全集高清', '全集超清', '全集蓝光', '全集HD', '全集1080p', '全集720p', '全集4K',
    '完结高清', '完结超清', '完结蓝光', '完结HD', '完结1080p', '完结720p', '完结4K'
  ];

  for (const label of labelsToRemove) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedLabel, 'gi');
    cleaned = cleaned.replace(regex, '');
  }

  cleaned = cleaned.replace(/\s*[-–—:：|·•、,，.。]\s*/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\[\s*\]/g, '').replace(/\(\s*\)/g, '').replace(/【\s*】/g, '').replace(/（\s*）/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || title;
}

console.log('清理效果测试：');
mockApiTitles.forEach((title, i) => {
  const cleaned = testCleanTitleFromLabels(title);
  console.log(`${i + 1}. 原始: "${title}"`);
  console.log(`   清理: "${cleaned}"`);
  console.log(`   状态: ${cleaned !== title ? '✅ 成功' : '❌ 失败'}`);
  console.log('');
});

console.log('\n=== 发现问题！！！ ===');
console.log('让我们看看有没有"全"字开头的标签被错误清理...');
console.log('\n测试特殊情况：');

const specialCases = [
  '全城高考',
  '全民目击',
  '全职杀手',
  '全金属外壳',
];

console.log('\n包含"全"字的正常影片名：');
specialCases.forEach((title, i) => {
  const cleaned = testCleanTitleFromLabels(title);
  console.log(`${i + 1}. 原始: "${title}"`);
  console.log(`   清理: "${cleaned}"`);
  console.log(`   状态: ${cleaned === title ? '✅ 正确（没有误删）' : '❌ 错误（误删了！）'}`);
  console.log('');
});
