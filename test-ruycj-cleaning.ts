/**
 * 标题清理测试 - 专门针对如意资源站的脏数据格式
 */

import { cleanTitleFromLabels } from './lib/utils/title-utils';

// 模拟如意资源站返回的脏数据
const ruycjDirtyTitles = [
  // 如意资源站常见格式
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
  '满城尽带黄金甲(高清版)-正片',
  '长津湖(2022)【蓝光高清】',
  '泰坦尼克号【BD高清】',
  '阿凡达：水之道 HD中字完整版',
  '速度与激情10 (2023) 超清版',
  '变形金刚：超能勇士崛起 (4K)',
  '闪电侠【2023】HD高清版',
  '疯狂元素城 2023 蓝光中字',
  '芭比 2023 高清正片',
  '银河护卫队3 (4K)蓝光',
];

console.log('=== 如意资源站标题清理测试 ===\n');
console.log('测试专门针对如意资源站脏数据格式的清理效果：\n');

let successCount = 0;
let failCount = 0;

ruycjDirtyTitles.forEach((dirtyTitle, index) => {
  const cleaned = cleanTitleFromLabels(dirtyTitle);
  const isCleaned = dirtyTitle !== cleaned;

  if (isCleaned) {
    successCount++;
    console.log(`✅ ${index + 1}. "${dirtyTitle}"`);
    console.log(`   清理后: "${cleaned}"`);
  } else {
    failCount++;
    console.log(`❌ ${index + 1}. "${dirtyTitle}"`);
    console.log(`   未能清理！`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`总结：`);
console.log(`  成功清理: ${successCount}/${ruycjDirtyTitles.length}`);
console.log(`  未能清理: ${failCount}/${ruycjDirtyTitles.length}`);
console.log('');

if (failCount > 0) {
  console.log('需要添加更多的标签到清理列表中！');
} else {
  console.log('🎉 所有标题都已成功清理！');
}
