// 识别未被清理的标签格式

import { cleanTitleFromLabels } from './lib/utils/title-utils';

// 模拟可能未被清理的边缘情况
const edgeCaseTitles = [
  // 边缘情况1：标签紧贴在文字后面，没有空格
  '流浪地球2HD',
  '满江红高清',
  '肖申克救赎HD高清',

  // 边缘情况2：特殊字符分隔
  '流浪地球2-HD',
  '流浪地球2—高清',
  '流浪地球2.高清',

  // 边缘情况3：数字+标签
  '复仇者联盟4K',
  '蜘蛛侠HD1080p',

  // 边缘情况4：混合标签
  '盗梦空间HD超清正片',
  '阿凡达2蓝光1080p完整版',

  // 边缘情况5：括号内的标签
  '满城尽带黄金甲(高清版)',
  '长津湖(蓝光版)',

  // 边缘情况6：其他特殊格式
  '功夫熊猫4[4K]',
  '蜘蛛侠[HD高清]',

  // 边缘情况7：如意资源站可能的特殊格式
  '流浪地球2高清版正片',
  '满江红HD1080p',
  '肖申克的救赎蓝光高清',
];

console.log('=== 边缘情况测试 ===\n');
console.log('测试未被清理的标签格式：\n');

let failedCases: string[] = [];

edgeCaseTitles.forEach((title, index) => {
  const cleaned = cleanTitleFromLabels(title);

  // 检查清理后是否还有常见的标签词
  const hasRemainingTags =
    cleaned.includes('HD') ||
    cleaned.includes('高清') ||
    cleaned.includes('超清') ||
    cleaned.includes('蓝光') ||
    cleaned.includes('正片') ||
    cleaned.includes('完整版') ||
    cleaned.includes('1080p') ||
    cleaned.includes('720p') ||
    cleaned.includes('4K') ||
    cleaned.includes('中文字幕') ||
    cleaned.includes('中字');

  if (hasRemainingTags || title !== cleaned) {
    console.log(`❌ ${index + 1}. 原始: "${title}"`);
    console.log(`   清理: "${cleaned}"`);
    console.log(`   残留: ${hasRemainingTags ? '有残留标签' : '无残留但有变化'}`);
  } else {
    console.log(`✅ ${index + 1}. "${title}" => "${cleaned}"`);
  }
  console.log('');
});

console.log('\n=== 总结 ===');
console.log('如果有 ❌ 项，说明这些格式的标签没有被完全清理');
console.log('需要添加这些格式到清理列表中');
