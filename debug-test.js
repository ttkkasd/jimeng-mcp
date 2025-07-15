#!/usr/bin/env node

// 调试测试脚本 - 直接测试API响应
import { JimengImageGenerator } from './dist/imageGenerator.js';

async function debugApiResponse() {
  console.log('开始调试即梦API响应...');
  
  // 检查环境变量
  if (!process.env.VOLCENGINE_ACCESS_KEY_ID || !process.env.VOLCENGINE_SECRET_ACCESS_KEY) {
    console.error('❌ 请设置环境变量 VOLCENGINE_ACCESS_KEY_ID 和 VOLCENGINE_SECRET_ACCESS_KEY');
    console.log('示例：');
    console.log('export VOLCENGINE_ACCESS_KEY_ID="your_access_key"');
    console.log('export VOLCENGINE_SECRET_ACCESS_KEY="your_secret_key"');
    process.exit(1);
  }
  
  const credentials = {
    accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID,
    secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY,
    region: 'cn-north-1',
    service: 'cv'
  };
  
  console.log('✅ 环境变量已设置');
  
  const generator = new JimengImageGenerator(credentials);
  
  try {
    console.log('📡 正在调用API...');
    const result = await generator.generateImage({
      prompt: '蓝天白云',
      req_key: 'jimeng_high_aes_general_v21_L'
    });
    
    console.log('\n=== 最终结果 ===');
    console.log('✅ 图像生成成功!');
    console.log('状态码:', result.algorithm_base_resp.status_code);
    console.log('状态消息:', result.algorithm_base_resp.status_message);
    console.log('请求ID:', result.algorithm_base_resp.request_id);
    console.log('图像URL数量:', result.image_urls.length);
    console.log('图像URLs:', result.image_urls);
    
    if (result.image_urls.length > 0) {
      console.log('\n📷 生成的图像:');
      result.image_urls.forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
      });
    } else {
      console.log('⚠️  警告: 没有返回图像URL');
    }
    
  } catch (error) {
    console.error('\n❌ 图像生成失败:');
    console.error('错误信息:', error.message);
    if (error.response) {
      console.error('HTTP状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

debugApiResponse();