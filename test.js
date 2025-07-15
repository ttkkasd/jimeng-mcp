#!/usr/bin/env node

// Test script for the Jimeng MCP server
import { JimengImageGenerator } from './dist/imageGenerator.js';

async function testImageGeneration() {
  console.log('Testing Jimeng Image Generation...');
  
  const credentials = {
    accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || '',
    region: 'cn-north-1',
    service: 'cv'
  };
  
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('Please set VOLCENGINE_ACCESS_KEY_ID and VOLCENGINE_SECRET_ACCESS_KEY environment variables');
    process.exit(1);
  }
  
  const generator = new JimengImageGenerator(credentials);
  
  try {
    const result = await generator.generateImage({
      prompt: '一只可爱的小猫在花园里玩耍，阳光明媚，高清摄影',
      width: 512,
      height: 512
    });
    
    console.log('✅ Image generation successful!');
    console.log('Status:', result.algorithm_base_resp.status_message);
    console.log('Request ID:', result.algorithm_base_resp.request_id);
    console.log('Image URLs:', result.image_urls);
    
  } catch (error) {
    console.error('❌ Image generation failed:', error.message);
    process.exit(1);
  }
}

testImageGeneration();