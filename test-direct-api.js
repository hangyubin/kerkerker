/**
 * 直接测试如意资源站API
 * 查看返回的 vod_name 字段内容
 */

async function testRuycjapi() {
  console.log('=== 直接测试如意资源站 API ===\n');

  const apiUrl = 'https://cj.rycjapi.com/api.php/provide/vod';
  const keyword = '流浪地球';

  console.log(`测试URL: ${apiUrl}?ac=videolist&wd=${encodeURIComponent(keyword)}\n`);

  try {
    const response = await fetch(`${apiUrl}?ac=videolist&wd=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ 请求失败: ${response.status}`);
      return;
    }

    const data = await response.json();

    console.log('API 响应分析：\n');
    console.log(`code: ${data.code}`);
    console.log(`msg: ${data.msg}`);
    console.log(`list 长度: ${data.list?.length || 0}\n`);

    if (data.list && data.list.length > 0) {
      console.log('前5个结果的 vod_name 字段：\n');

      data.list.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. vod_id: ${item.vod_id}`);
        console.log(`   vod_name: "${item.vod_name}"`);
        console.log(`   vod_pic: "${item.vod_pic}"`);
        console.log(`   vod_remarks: "${item.vod_remarks || '(无)'}"`);
        console.log('');
      });

      // 检查是否有任何 vod_name 包含多余标签
      const hasExtraLabels = data.list.some(item => {
        const name = item.vod_name || '';
        return /HD|高清|正片|1080p|720p|4K|中文字幕|完整版/.test(name);
      });

      console.log('='.repeat(60));
      console.log(`\n结论：`);

      if (hasExtraLabels) {
        console.log('❌ API返回的 vod_name 包含多余标签！');
        console.log('   例如: HD、高清、正片、1080p等');
        console.log('   这说明如意资源站的 videolist 接口本身就返回脏数据');
      } else {
        console.log('✅ API返回的 vod_name 是干净的');
        console.log('   如意资源站的 videolist 接口返回的是干净数据');
        console.log('   问题出在我们的代码处理上');
      }
    }

  } catch (error) {
    console.error('❌ 请求出错:', error);
  }
}

testRuycjapi();
