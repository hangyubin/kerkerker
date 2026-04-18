// 实际测试如意资源站API返回的数据

async function testRuycjapi() {
  console.log('=== 测试如意资源站 API 返回的数据 ===\n');

  const apiUrl = 'https://cj.rycjapi.com/api.php/provide/vod';
  const keyword = '流浪地球2';

  try {
    console.log(`请求: ${apiUrl}?ac=detail&wd=${keyword}\n`);

    const response = await fetch(`${apiUrl}?ac=detail&wd=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      console.error(`请求失败: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log('API 返回的原始数据：\n');

    if (data.code === 1 && data.list && data.list.length > 0) {
      console.log(`找到 ${data.list.length} 个结果：\n`);

      data.list.forEach((item: any, index: number) => {
        console.log(`【结果 ${index + 1}】`);
        console.log(`  vod_id: ${item.vod_id}`);
        console.log(`  vod_name: "${item.vod_name}"`);
        console.log(`  vod_remarks: "${item.vod_remarks}"`);
        console.log(`  vod_pic: "${item.vod_pic}"`);
        console.log('');
      });
    } else {
      console.log('未找到结果或API返回错误');
      console.log('API响应:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('请求出错:', error);
  }
}

testRuycjapi();
