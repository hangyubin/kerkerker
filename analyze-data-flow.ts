// 重新分析API返回数据和前端处理逻辑

async function analyzeAPIData() {
  console.log('=== 重新分析API返回数据 ===\n');

  // 模拟API返回的数据结构
  const mockAPIResponse = {
    code: 1,
    msg: 'success',
    list: [
      {
        vod_id: 1,
        vod_name: '流浪地球2 HD高清正片',
        vod_pic: 'https://example.com/pic1.jpg',
        vod_remarks: 'HD高清',
        type_name: '电影'
      },
      {
        vod_id: 2,
        vod_name: '满江红 高清完整版',
        vod_pic: 'https://example.com/pic2.jpg',
        vod_remarks: '高清完整版',
        type_name: '电影'
      }
    ]
  };

  console.log('1. API返回的原始数据：');
  console.log(JSON.stringify(mockAPIResponse, null, 2));
  console.log('');

  // 模拟formatDramaList处理
  function formatDramaList(list: any[], source: any) {
    return list.map((item) => ({
      id: item.vod_id,
      name: item.vod_name, // 这里没有清理！
      originalName: item.vod_name,
      subName: item.vod_sub || '',
      pic: item.vod_pic || '',
      remarks: item.vod_remarks || '',
      type: item.type_name || '影视',
      source: source,
    }));
  }

  const formatted = formatDramaList(mockAPIResponse.list, { key: 'rycjapi', name: '如意资源站' });
  console.log('2. formatDramaList处理后：');
  console.log(JSON.stringify(formatted, null, 2));
  console.log('');

  // 模拟前端搜索页面处理
  console.log('3. 前端搜索页面处理：');
  console.log('   - 过滤解说内容');
  console.log('   - 合并结果');
  console.log('   - 按清理后的标题分组');
  console.log('');

  // 模拟分组逻辑
  const grouped: Record<string, any[]> = {};
  formatted.forEach(result => {
    const originalTitle = result.name.trim();
    // 这里使用cleanTitleFromLabels清理
    const cleanedKey = '流浪地球2'; // 模拟清理结果
    if (!grouped[cleanedKey]) {
      grouped[cleanedKey] = [];
    }
    grouped[cleanedKey].push(result);
  });

  console.log('4. 分组结果：');
  console.log(JSON.stringify(grouped, null, 2));
  console.log('');

  // 模拟显示逻辑
  console.log('5. 显示给DoubanCard的数据：');
  Object.entries(grouped).forEach(([cleanedTitle, group]) => {
    const firstItem = group[0];
    const movieData = {
      id: String(firstItem.id),
      title: cleanedTitle, // 使用清理后的标题
      cover: firstItem.pic,
      rate: '',
      episode_info: firstItem.remarks || '',
      is_new: false,
      playable: true,
      url: '',
      cover_x: 0,
      cover_y: 0,
    };
    console.log(`   卡片标题: "${movieData.title}"`);
    console.log(`   原始标题: "${firstItem.name}"`);
  });

  console.log('\n=== 分析结论 ===');
  console.log('如果仍然显示多余标签，可能的原因：');
  console.log('1. API返回的数据格式还是包含标签');
  console.log('2. 前端处理时没有正确清理标题');
  console.log('3. 显示时使用了原始标题而不是清理后的标题');
  console.log('4. 缓存问题');
}

analyzeAPIData();
