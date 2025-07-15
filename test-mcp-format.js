#!/usr/bin/env node

// 测试MCP返回的图像URL
import { JimengImageGenerator } from './dist/imageGenerator.js';

async function testMCPFormat() {
  console.log('测试MCP返回格式...');
  
  const credentials = {
    accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID,
    secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY,
    region: 'cn-north-1',
    service: 'cv'
  };
  
  const generator = new JimengImageGenerator(credentials);
  
  try {
    const result = await generator.generateImage({
      prompt: '测试',
      req_key: 'jimeng_high_aes_general_v21_L'
    });
    
    console.log('\n=== MCP格式测试 ===');
    console.log('返回对象:', JSON.stringify(result, null, 2));
    console.log('image_urls数组:', result.image_urls);
    console.log('image_urls长度:', result.image_urls.length);
    console.log('第一个URL:', result.image_urls[0]);
    
    // 模拟MCP返回格式
    const mcpResponse = `图像生成成功！

状态: ${result.algorithm_base_resp.status_message || 'Unknown'}
请求ID: ${result.algorithm_base_resp.request_id || 'Unknown'}

生成的图像链接:
${result.image_urls.map((url, index) => `${index + 1}. ${url}`).join('\n')}`;

    console.log('\n=== MCP响应格式 ===');
    console.log(mcpResponse);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testMCPFormat();