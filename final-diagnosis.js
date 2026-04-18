/**
 * 最终诊断工具 - 收集所有关键信息
 *
 * 使用方法：
 * 1. 打开浏览器控制台 (F12)
 * 2. 粘贴此代码并执行
 * 3. 将所有输出发给我
 */

(function() {
  console.log('=== 最终诊断工具 ===\n');

  // 1. 检查代码版本
  console.log('1. 检查代码版本...');
  fetch('/api/server-config')
    .then(r => r.json())
    .then(data => {
      console.log('   服务器配置:', JSON.stringify(data, null, 2));
    })
    .catch(e => console.log('   无法获取服务器配置'));

  // 2. 测试 cleanTitleFromLabels 函数
  console.log('\n2. 测试 cleanTitleFromLabels 函数...');
  import('./lib/utils/title-utils').then(({ cleanTitleFromLabels }) => {
    const testCases = [
      '流浪地球2 HD高清正片',
      '满江红 高清完整版',
      '测试影片'
    ];

    testCases.forEach(title => {
      const result = cleanTitleFromLabels(title);
      console.log(`   "${title}" => "${result}" ${title !== result ? '✅ 清理了' : '⚠️ 未清理'}`);
    });
  }).catch(e => console.log('   无法导入 cleanTitleFromLabels 函数'));

  // 3. 检查 localStorage
  console.log('\n3. 检查 localStorage...');
  const keys = ['multi_source_matches', 'search_cache', 'douban_cache'];
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`   ${key}: 存在 (${JSON.stringify(parsed).length} 字符)`);

        // 检查是否有标题字段
        if (parsed.matches) {
          console.log(`     matches 数组长度: ${parsed.matches.length}`);
          if (parsed.matches.length > 0) {
            console.log(`     第一个匹配的 vod_name: "${parsed.matches[0].vod_name}"`);
          }
        }
      } catch (e) {
        console.log(`   ${key}: 存在但无法解析`);
      }
    } else {
      console.log(`   ${key}: 不存在`);
    }
  });

  // 4. 清除缓存
  console.log('\n4. 清除缓存...');
  localStorage.removeItem('multi_source_matches');
  console.log('   ✅ 已清除 multi_source_matches');
  sessionStorage.clear();
  console.log('   ✅ 已清除 sessionStorage');

  // 5. 收集网络请求
  console.log('\n5. 收集网络请求信息...');
  console.log('   请在 Network 标签中检查以下请求:');
  console.log('   - /api/drama/search-stream - 搜索请求');
  console.log('   - 查看响应中的 name 字段');

  console.log('\n=== 诊断完成 ===');
  console.log('请将以上输出复制给我，并告诉我:');
  console.log('1. 是否有任何 ⚠️ 标记的项？');
  console.log('2. localStorage 中是否有数据？');
  console.log('3. 搜索后 name 字段的值是什么？');

  // 6. 提示用户搜索
  console.log('\n6. 下一步:');
  console.log('   - 刷新页面 (F5)');
  console.log('   - 搜索"流浪地球"或"满江红"');
  console.log('   - 告诉我影片名是否还有多余标签');
})();
