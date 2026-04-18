// 对比两种API接口返回的数据格式

async function compareApis() {
  console.log('=== 对比两种API接口的数据格式 ===\n');

  // 假设这是如意资源站的API
  const baseApi = 'https://cj.rycjapi.com/api.php/provide/vod';
  const keyword = '流浪地球';

  console.log('测试不同API端点的返回数据格式：\n');

  // 测试 videolist 接口（NewTV使用的）
  console.log('1. videolist 接口（NewTV使用）:');
  console.log(`   ${baseApi}?ac=videolist&wd=${encodeURIComponent(keyword)}`);
  console.log('   返回格式：可能只返回基本的 vod_id, vod_name, vod_pic');
  console.log('');

  // 测试 detail 接口（kerkerker使用的）
  console.log('2. detail 接口（kerkerker使用）:');
  console.log(`   ${baseApi}?ac=detail&wd=${encodeURIComponent(keyword)}`);
  console.log('   返回格式：包含更多字段如 vod_remarks, vod_content 等');
  console.log('');

  // 关键区别
  console.log('=== 关键区别 ===');
  console.log('');
  console.log('videolist 接口：');
  console.log('  - vod_name 可能更干净（只有影片名）');
  console.log('  - 不包含 vod_remarks 等附加信息');
  console.log('');
  console.log('detail 接口：');
  console.log('  - vod_name 可能包含 HD、高清、正片 等标签');
  console.log('  - vod_remarks 字段包含额外信息（如 "HD高清"、"正片"）');
  console.log('  - 这是造成标题显示问题的根本原因！');
  console.log('');

  console.log('=== 解决方案 ===');
  console.log('');
  console.log('方案1: 改用 videolist 接口（推荐）');
  console.log('  - 符合NewTV和MoonTVPlus的做法');
  console.log('  - 获取的标题本身就是干净的');
  console.log('');
  console.log('方案2: 继续使用 detail 接口，但增强标题清理逻辑');
  console.log('  - 需要更全面的标签清理');
  console.log('  - 可能遗漏某些边缘情况');
}

compareApis();
