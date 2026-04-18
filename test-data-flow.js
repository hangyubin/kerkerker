/**
 * 简单测试 - 验证数据流
 *
 * 使用方法：
 * 在浏览器控制台中执行
 */

async function testDataFlow() {
  console.log('=== 数据流测试 ===\n');

  // 1. 直接测试 API
  const keyword = '流浪地球';
  console.log(`1. 调用API: /api/drama/search-stream?q=${keyword}\n`);

  const response = await fetch(`/api/drama/search-stream?q=${encodeURIComponent(keyword)}`);

  if (!response.ok) {
    console.log(`❌ API请求失败: ${response.status}`);
    return;
  }

  console.log('✅ API请求成功，开始读取数据...\n');

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    console.log('❌ 无法读取响应流');
    return;
  }

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
            console.log(`📺 源 #${resultCount}: ${data.sourceName}`);
            console.log(`   找到 ${data.count} 个结果\n`);

            if (data.results && data.results.length > 0) {
              console.log('   前3个结果的 name 字段:');
              data.results.slice(0, 3).forEach((r, i) => {
                console.log(`     ${i + 1}. "${r.name}"`);
                if (r.originalName && r.originalName !== r.name) {
                  console.log(`        (原始: "${r.originalName}")`);
                }
              });
              console.log('');
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  console.log('=== 测试完成 ===');
  console.log(`总共处理了 ${resultCount} 个源的结果`);

  if (resultCount === 0) {
    console.log('\n⚠️ 没有收到任何结果');
    console.log('可能原因：');
    console.log('1. 数据库中没有配置视频源');
    console.log('2. API请求全部失败');
  }
}

// 执行测试
testDataFlow();
