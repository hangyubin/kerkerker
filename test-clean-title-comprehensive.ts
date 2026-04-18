// 全面测试 cleanTitleFromLabels 函数

import { cleanTitleFromLabels } from './lib/utils/title-utils';

// 测试用例 - 包含各种实际可能出现的格式
const testCases = [
  // 基本情况
  { input: '流浪地球2', expected: '流浪地球2' },
  
  // 常见标签
  { input: '流浪地球2 HD', expected: '流浪地球2' },
  { input: '流浪地球2 高清', expected: '流浪地球2' },
  { input: '流浪地球2 正片', expected: '流浪地球2' },
  
  // 组合标签
  { input: '流浪地球2 HD高清正片', expected: '流浪地球2' },
  { input: '流浪地球2 高清完整版', expected: '流浪地球2' },
  
  // 括号内的标签
  { input: '流浪地球2 (HD)', expected: '流浪地球2' },
  { input: '流浪地球2 [高清]', expected: '流浪地球2' },
  { input: '流浪地球2 【蓝光】', expected: '流浪地球2' },
  
  // 特殊字符分隔
  { input: '流浪地球2-HD', expected: '流浪地球2' },
  { input: '流浪地球2.高清', expected: '流浪地球2' },
  
  // 数字+标签
  { input: '流浪地球2 1080p', expected: '流浪地球2' },
  { input: '流浪地球2 4K', expected: '流浪地球2' },
  
  // 语言标签
  { input: '流浪地球2 中文字幕', expected: '流浪地球2' },
  { input: '流浪地球2 中字', expected: '流浪地球2' },
  
  // 状态标签
  { input: '流浪地球2 已完结', expected: '流浪地球2' },
  { input: '流浪地球2 完结', expected: '流浪地球2' },
  
  // 复杂组合
  { input: '流浪地球2 HD高清1080p中文字幕正片', expected: '流浪地球2' },
  { input: '流浪地球2 蓝光4K完整版', expected: '流浪地球2' },
  
  // 边缘情况
  { input: '流浪地球2HD', expected: '流浪地球2' },
  { input: '流浪地球2高清', expected: '流浪地球2' },
  { input: '流浪地球2正片', expected: '流浪地球2' },
];

console.log('=== 全面测试 cleanTitleFromLabels 函数 ===\n');

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const result = cleanTitleFromLabels(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    passCount++;
    console.log(`✅ ${index + 1}. "${testCase.input}" => "${result}"`);
  } else {
    failCount++;
    console.log(`❌ ${index + 1}. "${testCase.input}"`);
    console.log(`   期望: "${testCase.expected}"`);
    console.log(`   实际: "${result}"`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`测试结果: ${passCount}/${testCases.length} 通过`);

if (failCount > 0) {
  console.log(`\n❌ 有 ${failCount} 个测试用例失败`);
  console.log('需要修复 cleanTitleFromLabels 函数');
} else {
  console.log('\n🎉 所有测试用例都通过了！');
  console.log('cleanTitleFromLabels 函数工作正常');
}
