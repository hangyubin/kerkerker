/**
 * 视频源标题诊断工具
 *
 * 使用方法：
 * 1. 在浏览器中打开开发者工具 (F12)
 * 2. 在控制台中粘贴以下代码并执行
 * 3. 查看哪些源的 vod_name 包含多余标签
 */

// 模拟检测逻辑
function diagnoseVideoSources() {
  console.log('=== 视频源标题诊断 ===\n');

  // 模拟不同视频源的返回数据
  const mockSources = [
    {
      name: '如意资源站',
      vod_name: '流浪地球2 HD高清正片',
      hasTags: true
    },
    {
      name: '量子资源',
      vod_name: '流浪地球2',
      hasTags: false
    },
    {
      name: '非凡资源',
      vod_name: '流浪地球2(2023)',
      hasTags: false
    }
  ];

  // 检测多余标签的正则表达式
  const tagPattern = /HD|高清|超清|蓝光|正片|1080p|720p|4K|中文字幕|完整版|已完结/;

  console.log('检测结果：\n');

  mockSources.forEach(source => {
    const hasTags = tagPattern.test(source.vod_name);
    console.log(`${source.name}:`);
    console.log(`  vod_name: "${source.vod_name}"`);
    console.log(`  状态: ${hasTags ? '❌ 包含多余标签' : '✅ 干净'}`);
    console.log('');
  });

  console.log('\n如果是如意资源站的问题，说明该源返回的数据本身就包含标签');
  console.log('需要在该源的API响应处理中添加额外的清理逻辑');
}

diagnoseVideoSources();
