/**
 * 批量测试视频源API
 * 测试各个源的 vod_name 字段是否包含多余标签
 */

const apiSites = [
  { key: "dyttzy", name: "电影天堂", api: "http://caiji.dyttzyapi.com/api.php/provide/vod" },
  { key: "bfzy", name: "暴风资源", api: "https://bfzyapi.com/api.php/provide/vod" },
  { key: "tyyszy", name: "天涯资源", api: "https://tyyszy.com/api.php/provide/vod" },
  { key: "ffzy", name: "非凡影视", api: "https://api.ffzyapi.com/api.php/provide/vod" },
  { key: "zy360", name: "360资源", api: "https://360zy.com/api.php/provide/vod" },
  { key: "maotaizy", name: "茅台资源", api: "https://caiji.maotaizy.cc/api.php/provide/vod" },
  { key: "wolong", name: "卧龙资源", api: "https://wolongzyw.com/api.php/provide/vod" },
  { key: "jisu", name: "极速资源", api: "https://jszyapi.com/api.php/provide/vod" },
  { key: "dbzy", name: "豆瓣资源", api: "https://dbzy.tv/api.php/provide/vod" },
  { key: "mozhua", name: "魔爪资源", api: "https://mozhuazy.com/api.php/provide/vod" },
  { key: "mdzy", name: "魔都资源", api: "https://www.mdzyapi.com/api.php/provide/vod" },
  { key: "zuid", name: "最大资源", api: "https://api.zuidapi.com/api.php/provide/vod" },
  { key: "yinghua", name: "樱花资源", api: "https://m3u8.apiyhzy.com/api.php/provide/vod" },
  { key: "wujin", name: "无尽资源", api: "https://api.wujinapi.me/api.php/provide/vod" },
  { key: "wwzy", name: "旺旺短剧", api: "https://wwzy.tv/api.php/provide/vod" },
  { key: "ikun", name: "iKun资源", api: "https://ikunzyapi.com/api.php/provide/vod" },
  { key: "lzi", name: "量子资源", api: "https://cj.lziapi.com/api.php/provide/vod" },
  { key: "bdzy", name: "百度资源", api: "https://api.apibdzy.com/api.php/provide/vod" },
  { key: "hongniuzy", name: "红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod" },
  { key: "xinlangaa", name: "新浪资源", api: "https://api.xinlangapi.com/xinlangapi.php/provide/vod" },
  { key: "ckzy", name: "CK资源", api: "https://ckzy.me/api.php/provide/vod" },
  { key: "ukuapi", name: "U酷资源", api: "https://api.ukuapi.com/api.php/provide/vod" },
  { key: "1080zyk", name: "1080资源", api: "https://api.1080zyku.com/inc/apijson.php/" },
  { key: "hhzyapi", name: "豪华资源", api: "https://hhzyapi.com/api.php/provide/vod" },
  { key: "subocaiji", name: "速博资源", api: "https://subocaiji.com/api.php/provide/vod" },
  { key: "p2100", name: "飘零资源", api: "https://p2100.net/api.php/provide/vod" },
  { key: "aqyzy", name: "爱奇艺", api: "https://iqiyizyapi.com/api.php/provide/vod" },
  { key: "yzzy", name: "优质资源", api: "https://api.yzzy-api.com/inc/apijson.php" },
  { key: "myzy", name: "猫眼资源", api: "https://api.maoyanapi.top/api.php/provide/vod" },
  { key: "rycj", name: "如意资源", api: "https://cj.rycjapi.com/api.php/provide/vod" },
  { key: "jinyingzy", name: "金鹰点播", api: "https://jinyingzy.com/api.php/provide/vod" },
  { key: "guangsuapi", name: "光速资源", api: "https://api.guangsuapi.com/api.php/provide/vod" }
];

const keyword = "流浪地球";
const testLimit = 5; // 每个源测试前5个结果

// 检测多余标签的正则
const extraTagsRegex = /HD|高清|正片|1080p|720p|4K|中文字幕|完整版|已完结|完结|更新至|更新|连载中|在线观看|免费观看|观看|全集|无删减|未删减|未删节/;

async function testApi(apiSite) {
  console.log(`\n=== 测试 ${apiSite.name} ===`);
  console.log(`API: ${apiSite.api}`);

  try {
    const url = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(keyword)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      console.log(`❌ 请求失败: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    if (!data || data.code !== 1 || !data.list || data.list.length === 0) {
      console.log(`❌ 无数据: code=${data?.code}, list.length=${data?.list?.length || 0}`);
      return { success: false, error: '无数据' };
    }

    console.log(`✅ 成功: 找到 ${data.list.length} 个结果`);

    // 分析前几个结果
    const results = data.list.slice(0, testLimit);
    let hasExtraTags = false;

    console.log('\n前5个结果的 vod_name:');
    results.forEach((item, index) => {
      const vodName = item.vod_name || '';
      const hasTags = extraTagsRegex.test(vodName);
      if (hasTags) hasExtraTags = true;
      
      console.log(`${index + 1}. "${vodName}" ${hasTags ? '⚠️ 含标签' : '✅ 干净'}`);
      if (item.vod_remarks) {
        console.log(`   备注: "${item.vod_remarks}"`);
      }
    });

    console.log(`\n结论: ${hasExtraTags ? '❌ 包含多余标签' : '✅ 干净'}`);
    return { success: true, hasExtraTags };

  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('=== 批量测试视频源 API ===\n');
  console.log(`测试关键词: "${keyword}"`);
  console.log(`每个源测试前 ${testLimit} 个结果\n`);

  const results = [];

  for (const apiSite of apiSites) {
    const result = await testApi(apiSite);
    results.push({ ...apiSite, ...result });
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80));
  console.log('=== 测试结果汇总 ===');
  console.log('\n✅ 干净的源:');
  results.filter(r => r.success && !r.hasExtraTags).forEach(r => {
    console.log(`   ${r.name}`);
  });

  console.log('\n❌ 包含多余标签的源:');
  results.filter(r => r.success && r.hasExtraTags).forEach(r => {
    console.log(`   ${r.name}`);
  });

  console.log('\n❌ 请求失败的源:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`   ${r.name}: ${r.error}`);
  });

  console.log('\n' + '='.repeat(80));
}

runTests();
