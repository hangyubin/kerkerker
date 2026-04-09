// 测试登录 API 的脚本
const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟登录请求
function testLogin() {
  console.log('测试登录 API...');
  
  const postData = JSON.stringify({ password: 'admin123' });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('状态码:', res.statusCode);
    console.log('响应头:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应数据:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ 登录 API 调用成功');
      } else {
        console.log('❌ 登录 API 调用失败');
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('请求失败:', e.message);
  });
  
  req.write(postData);
  req.end();
}

// 启动测试
testLogin();
