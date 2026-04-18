import { cleanTitleFromLabels } from './lib/utils/title-utils';

console.log('测试标题清理效果：');
console.log('='.repeat(60));

const testCases = [
  '测试电影 高清 HD 1080p',
  '测试电影 正片 中文字幕 已完结',
  '复仇者联盟4 蓝光版 超清 全集',
  '流浪地球2 HD超清中字',
  '满江红-高清版 完整版',
  '功夫熊猫4 【HD】 蓝光',
  '（高清）长津湖 中字',
  '功夫熊猫4 蓝光 正片',
  '满江红 正片 完整版',
  '复仇者联盟4 全集 超清',
  '长津湖 中字 蓝光',
  '流浪地球2 HD 高清',
  '功夫熊猫4 蓝光 超清',
  '满江红 高清 正片',
  '复仇者联盟4 超清 全集'
];

testCases.forEach((test, index) => {
  const cleaned = cleanTitleFromLabels(test);
  console.log(`${index + 1}. 原标题: "${test}"`);
  console.log(`   清理后: "${cleaned}"`);
  console.log(`   是否相同: ${test === cleaned ? '否' : '是'}`);
  console.log('');
});

console.log('='.repeat(60));
