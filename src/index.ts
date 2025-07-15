#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { JimengImageGenerator, ImageGenerationParams } from './imageGenerator.js';
import { VolcengineCredentials } from './auth.js';

const server = new Server(
  {
    name: 'jimeng-mcp',
    version: '1.0.0',
  }
);

// Initialize image generator with credentials from environment
const credentials: VolcengineCredentials = {
  accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || '',
  region: 'cn-north-1',
  service: 'cv'
};

// Validate credentials at startup
if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error('Error: Missing Volcengine credentials. Please set VOLCENGINE_ACCESS_KEY_ID and VOLCENGINE_SECRET_ACCESS_KEY environment variables.');
  process.exit(1);
}

const imageGenerator = new JimengImageGenerator(credentials);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: 'generateImage',
      description: '调用即梦AI生成图像',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: '生成图像的文本描述'
          },
          req_key: {
            type: 'string',
            description: '模型版本，默认值: jimeng_high_aes_general_v21_L',
            default: 'jimeng_high_aes_general_v21_L'
          },
          seed: {
            type: 'number',
            description: '随机种子，默认值：-1',
            default: -1
          },
          negative_prompt: {
            type: 'string',
            description: '负面提示词，描述不希望在图像中出现的内容'
          }
        },
        required: ['prompt']
      }
    }
  ];

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'generateImage') {
    try {
      const params = args as unknown as ImageGenerationParams;
      
      if (!params.prompt) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: prompt parameter is required for image generation.'
            }
          ]
        };
      }

      console.log('=== MCP 调试 ===');
      console.log('请求参数:', params);
      
      const result = await imageGenerator.generateImage(params);
      
      console.log('返回结果:', JSON.stringify(result, null, 2));
      console.log('Algorithm base resp:', result.algorithm_base_resp);
      console.log('Image URLs:', result.image_urls);
      console.log('Image URLs 长度:', result.image_urls?.length);
      console.log('结果类型:', typeof result);
      console.log('==============');
      
      // 检查结果是否有效
      if (!result || !result.algorithm_base_resp) {
        return {
          content: [
            {
              type: 'text',
              text: `图像生成失败：无效的响应格式\n\n原始响应: ${JSON.stringify(result, null, 2)}`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `图像生成成功！\n\n状态: ${result.algorithm_base_resp.status_message || 'Unknown'}\n请求ID: ${result.algorithm_base_resp.request_id || 'Unknown'}\n\n生成的图像链接:\n${result.image_urls.map((url, index) => `${index + 1}. ${url}`).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jimeng MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});