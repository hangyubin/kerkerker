/**
 * 浏览器控制台诊断工具
 *
 * 使用方法：
 * 1. 打开浏览器控制台 (F12)
 * 2. 粘贴此代码并按 Enter
 */

console.log('=== 浏览器控制台诊断工具 ===\n');

// 1. 检查是否有缓存数据
console.log('1. 检查 localStorage 缓存:');
const cached = localStorage.getItem("multi_source_matches");
if (cached) {
  try {
    const data = JSON.parse(cached);
    console.log('   ⚠️  发现缓存数据');
    console.log(`   包含 ${data.matches?.length || 0} 个源的匹配数据`);
    console.log('\n   前3个源的 vod_name:');
    data.matches?.slice(0, 3).forEach((m, i) => {
      console.log(`     ${i+1}. vod_name: "${m.vod_name}"`);
    });
    console.log('\n   ❌ 这可能是问题的原因！');
    console.log('   建议：清除缓存后重新测试');
  } catch (e) {
    console.log('   ⚠️  缓存数据格式错误');
  }
} else {
  console.log('   ✅ 没有缓存数据');
}
console.log('');

// 2. 提供清除命令
console.log('2. 清除缓存命令:');
console.log('   localStorage.removeItem("multi_source_matches");');
console.log('   sessionStorage.clear();');
console.log('   location.reload();');
console.log('');

// 3. 检查网络请求
console.log('3. 检查网络请求:');
console.log('   - 打开 Network (网络) 标签');
console.log('   - 筛选 XHR/Fetch 请求');
console.log('   - 搜索 "search-stream" 或 "api/drama"');
console.log('   - 查看响应数据中的 name 字段');
console.log('');

// 4. 提供手动测试代码
console.log('4. 手动测试 API:');
console.log('   复制以下代码到控制台执行:\n');
console.log(`fetch('/api/drama/search-stream?keyword=${encodeURIComponent('测试')}')
  .then(r => r.body?.getReader())
  .then(reader => {
    const decoder = new TextDecoder();
    let buffer = '';
    return new Promise(resolve => {
      function read() {
        reader.read().then(({done, value}) => {
          if (done) { resolve(buffer); return; }
          buffer += decoder.decode(value, { stream: true });
          read();
        });
      }
      read();
    });
  })
  .then(buffer => {
    console.log('API 响应片段:');
    buffer.split('\\n').slice(0, 10).forEach(line => {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'result' && data.results) {
            console.log('结果示例:');
            data.results.slice(0, 3).forEach(r => {
              console.log('  name:', r.name);
            });
          }
        } catch(e) {}
      }
    });
  });`);

// 实际执行清除
console.log('\n=== 执行清除 ===');
localStorage.removeItem("multi_source_matches");
console.log('✅ 已清除 localStorage.multi_source_matches');
console.log('请刷新页面 (F5) 重新测试');
