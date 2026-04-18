/**
 * 端到端诊断 - 测试完整的数据流
 *
 * 使用方法：
 * 1. 在浏览器控制台 (F12) 中粘贴此代码
 * 2. 执行并查看完整的数据流程
 */

console.log('=== 端到端数据流诊断 ===\n');

// 测试 cleanTitleFromLabels 函数
import('./lib/utils/title-utils').then(({ cleanTitleFromLabels }) => {
  console.log('1. 测试 cleanTitleFromLabels 函数:');

  const testCases = [
    '流浪地球2 HD高清正片',
    '满江红 高清完整版',
    '长津湖 中文字幕全集'
  ];

  testCases.forEach((title, i) => {
    const cleaned = cleanTitleFromLabels(title);
    console.log(`   ${i+1}. "${title}" => "${cleaned}"`);
    console.log(`      状态: ${cleaned === title.split(' ')[0] ? '✅' : '❌'}`);
  });

  console.log('\n2. 检查全局数据:');

  // 检查 localStorage 中的数据
  const multiSourceMatches = localStorage.getItem("multi_source_matches");
  if (multiSourceMatches) {
    try {
      const data = JSON.parse(multiSourceMatches);
      console.log(`   multi_source_matches 存在，包含 ${data.matches?.length || 0} 个源`);

      // 检查前几个的 vod_name
      if (data.matches && data.matches.length > 0) {
        console.log('   前3个源的 vod_name:');
        data.matches.slice(0, 3).forEach((m, i) => {
          const hasExtraLabels = m.vod_name &&
            (m.vod_name.includes('HD') ||
             m.vod_name.includes('高清') ||
             m.vod_name.includes('正片'));
          console.log(`     ${i+1}. "${m.vod_name}" ${hasExtraLabels ? '❌ 有多余标签' : '✅ 干净'}`);
        });
      }
    } catch (e) {
      console.log('   ⚠️ 无法解析 multi_source_matches');
    }
  } else {
    console.log('   ✅ 没有缓存数据');
  }

  console.log('\n3. 诊断建议:');
  console.log('   如果 vod_name 显示有多余标签：');
  console.log('   - 检查 /api/drama/search-stream 接口返回的原始数据');
  console.log('   - 在 Network 标签中查看 XHR 请求');
  console.log('   - 查看 search-stream 接口的响应内容');

  console.log('\n4. 强制清理测试:');
  console.log('   在控制台执行以下命令清理缓存:');
  console.log('   localStorage.removeItem("multi_source_matches");');
  console.log('   location.reload();');

  // 自动清理
  localStorage.removeItem("multi_source_matches");
  console.log('\n✅ 已自动清理 multi_source_matches');
  console.log('请刷新页面 (F5) 重新测试');
});
