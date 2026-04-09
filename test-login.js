// 测试登录功能的脚本
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('测试登录功能...');
    
    // 测试默认密码
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'admin123' }),
    });
    
    console.log('状态码:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('响应数据:', data);
    
    if (response.ok) {
      console.log('✅ 登录成功');
    } else {
      console.log('❌ 登录失败');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testLogin();
