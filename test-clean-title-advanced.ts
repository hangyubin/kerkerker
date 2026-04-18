import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('高级测试 - 标题清理效果：');
console.log('='.repeat(80));

const advancedTestCases = [
  '肖申克的救赎 1080P 蓝光高清正片',
  '盗梦空间 HD超清中文字幕完整版',
  '星际穿越 4K杜比视界已完结',
  '泰坦尼克号 【BD高清】国语配音',
  '阿凡达2 水之道 高清版 中英双字',
  '流浪地球2 HD超清中字全集',
  '满江红-高清版 完整版正片',
  '功夫熊猫4 蓝光 正片 未删减',
  '长津湖 中字 蓝光版 抢先版',
  '复仇者联盟4 超清 全集 导演剪辑版',
  '蜘蛛侠 纵横宇宙 1080p 高清完整版',
  '奥本海默 蓝光中字 已完结全集',
  '芭比 2023 HD高清正片 国语版',
  '碟中谍7 致命清算 上 4K超清版',
  '银河护卫队3 蓝光高清 中文字幕',
  '速度与激情10 HD完整版 中英字幕',
  '蜘蛛侠 纵横宇宙 (2023) 高清版',
  '闪电侠 【HD高清】 正片 中字',
  '变形金刚 超能勇士崛起 蓝光版',
  '疯狂元素城 HD超清中字 完整版',
  '蜘蛛侠纵横宇宙 1080p高清版正片',
  '银河护卫队3 (2023) 蓝光中字',
  '速度与激情10 HD高清 完整版正片',
  '阿凡达水之道 4K超清 中文字幕',
  '流浪地球2 【HD】蓝光 正片全集'
];

advancedTestCases.forEach((test, index) => {
  const cleaned = cleanTitleFromLabels(test);
  console.log(`${index + 1}. 原标题: "${test}"`);
  console.log(`   清理后: "${cleaned}"`);
  console.log(`   成功: ${test !== cleaned ? '✅' : '❌'}`);
  console.log('');
});

console.log('='.repeat(80));
console.log(`总计: ${advancedTestCases.length} 个测试用例`);
const successCount = advancedTestCases.filter(test => test !== cleanTitleFromLabels(test)).length;
console.log(`成功: ${successCount} 个`);
console.log(`失败: ${advancedTestCases.length - successCount} 个`);
console.log('='.repeat(80));
