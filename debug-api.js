/**
 * API调试工具 - 实际测试API返回的数据
 *
 * 使用方法：
 * 1. 重启开发服务器
 * 2. 在浏览器控制台 (F12) 中粘贴此代码
 * 3. 查看控制台输出的详细日志
 */

async function debugAPI() {
  console.log('=== API调试工具 ===\n');

  // 测试搜索API
  const testKeyword = '流浪地球';

  console.log(`测试关键词: "${testKeyword}"\n`);

  try {
    // 调用搜索API
    console.log('1. 调用搜索API...');
    const response = await fetch(`/api/drama/search-stream?keyword=${encodeURIComponent(testKeyword)}`);

    if (!response.ok) {
      console.log(`❌ API请求失败: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.log('❌ 无法读取响应流');
      return;
    }

    console.log('✅ API请求成功\n');
    console.log('开始解析响应数据...\n');

    let buffer = '';
    let resultCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'result') {
              resultCount++;
              console.log(`📺 结果 #${resultCount}`);
              console.log(`   源: ${data.sourceName}`);
              console.log(`   数量: ${data.count}`);

              if (data.results && data.results.length > 0) {
                console.log(`   前3个影片的标题:`);
                data.results.slice(0, 3).forEach((r, i) => {
                  console.log(`     ${i + 1}. name: "${r.name}"`);
                  console.log(`        originalName: "${r.originalName || '(无)'}"`);
                  console.log(`        remarks: "${r.remarks || '(无)'}"`);
                });
              }
              console.log('');
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    console.log(`\n=== 调试总结 ===`);
    console.log(`总共收到 ${resultCount} 个源的结果`);

    if (resultCount === 0) {
      console.log('\n⚠️ 没有收到任何结果');
      console.log('可能的原因：');
      console.log('1. 数据库中没有配置视频源');
      console.log('2. 所有视频源都请求失败');
      console.log('3. API地址配置错误');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 执行调试
debugAPI();
