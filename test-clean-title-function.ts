// 测试 cleanTitleFromLabels 函数的实际效果

import { cleanTitleFromLabels } from './lib/utils/title-utils';

const testTitles = [
  '流浪地球2 HD高清正片',
  '满江红 高清完整版',
  '长津湖 中文字幕全集',
  '肖申克的救赎 已完结',
  '盗梦空间 蓝光版',
  '复仇者联盟4 1080p',
  '功夫熊猫4 超清全集',
  '蜘蛛侠 纵横宇宙 HD中字',
  '阿凡达2 水之道 高清完整版',
  '奥本海默 4K杜比视界',
];

console.log('=== 测试 cleanTitleFromLabels 函数 ===\n');

testTitles.forEach((title, index) => {
  const cleaned = cleanTitleFromLabels(title);
  console.log(`${index + 1}. 原始: "${title}"`);
  console.log(`   清理: "${cleaned}"`);
  console.log(`   状态: ${title !== cleaned ? '✅ 成功' : '❌ 失败'}`);
  console.log('');
});
