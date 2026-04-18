// 测试 videolist 接口的返回格式

async function testVideolistFormat() {
  console.log('=== 测试 videolist 接口返回格式 ===\n');

  // 模拟 videolist 接口可能的返回格式
  const mockVideolistResponse = {
    code: 1,
    msg: 'success',
    list: [
      {
        // 注意：这里可能不是 vod_name，而是其他字段名！
        name: '流浪地球2 HD高清正片',  // 可能是 name 而不是 vod_name
        id: 1,
        pic: 'https://example.com/pic1.jpg',
        remarks: 'HD高清',
        type: '电影'
      }
    ]
  };

  const mockDetailResponse = {
    code: 1,
    msg: 'success',
    list: [
      {
        vod_id: 1,
        vod_name: '流浪地球2 HD高清正片',  // detail 接口使用 vod_name
        vod_pic: 'https://example.com/pic1.jpg',
        vod_remarks: 'HD高清',
        type_name: '电影'
      }
    ]
  };

  console.log('1. videolist 接口可能的返回格式：');
  console.log(JSON.stringify(mockVideolistResponse, null, 2));
  console.log('');

  console.log('2. detail 接口的返回格式：');
  console.log(JSON.stringify(mockDetailResponse, null, 2));
  console.log('');

  console.log('=== 关键问题 ===');
  console.log('videolist 接口可能使用不同的字段名：');
  console.log('- name 而不是 vod_name');
  console.log('- id 而不是 vod_id');
  console.log('- pic 而不是 vod_pic');
  console.log('- remarks 而不是 vod_remarks');
  console.log('- type 而不是 type_name');
  console.log('');

  console.log('如果是这样，我们的 formatDramaList 函数会：');
  console.log('1. 找不到 vod_name 字段，所以 item.vod_name 是 undefined');
  console.log('2. cleanTitleFromLabels(undefined) 会返回 undefined');
  console.log('3. 最终 name 字段会是 undefined');
  console.log('4. 前端会显示 undefined 或者原始的未清理数据');
}

testVideolistFormat();
