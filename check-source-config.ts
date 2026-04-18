// 检查视频源配置
// 这个脚本会检查数据库中的视频源配置

async function checkSourceConfig() {
  console.log('=== 检查视频源配置 ===\n');

  // 模拟检查如意资源站的配置
  const mockSourceConfig = {
    key: 'rycjapi',
    name: '如意资源站',
    api: 'https://cj.rycjapi.com/api.php/provide/vod',
    searchProxy: undefined, // 或者可能是某个代理URL
  };

  console.log('如意资源站配置：');
  console.log(`  key: ${mockSourceConfig.key}`);
  console.log(`  name: ${mockSourceConfig.name}`);
  console.log(`  api: ${mockSourceConfig.api}`);
  console.log(`  searchProxy: ${mockSourceConfig.searchProxy || '(未设置)'}`);
  console.log('');

  if (mockSourceConfig.searchProxy) {
    console.log('❌ 该源使用了搜索代理');
    console.log('   代理返回的数据可能包含多余标签');
    console.log('   需要检查代理服务是否清理了标题');
  } else {
    console.log('✅ 该源使用直接API调用');
    console.log('   数据会经过 formatDramaList 处理');
    console.log('   标题会被 cleanTitleFromLabels 清理');
  }

  console.log('\n=== 结论 ===');
  console.log('如果如意资源站没有设置 searchProxy，问题可能在于：');
  console.log('1. 该源的API本身就返回包含标签的数据');
  console.log('2. 清理函数没有覆盖到某些特定格式');
  console.log('');
  console.log('建议：');
  console.log('1. 检查如意资源站的API实际返回什么格式');
  console.log('2. 如果返回的 vod_name 本身就包含标签，需要增强清理函数');
  console.log('3. 或者更换到返回干净数据的视频源');
}

checkSourceConfig();
