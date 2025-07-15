import axios from 'axios';
import { VolcengineAuth, VolcengineCredentials } from './auth.js';

export interface ImageGenerationParams {
  prompt: string;
  req_key?: string;
  seed?: number;
  negative_prompt?: string;
}

export interface ImageGenerationResponse {
  algorithm_base_resp: {
    status_code: number;
    status_message: string;
    request_id: string;
  };
  image_urls: string[];
  log_id: string;
  raw_response?: any;
}

export class JimengImageGenerator {
  private auth: VolcengineAuth;
  private baseUrl = 'https://visual.volcengineapi.com';

  constructor(credentials: VolcengineCredentials) {
    this.auth = new VolcengineAuth(credentials);
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const timestamp = this.getTimestamp();
    const payload = JSON.stringify({
      req_key: params.req_key || 'jimeng_high_aes_general_v21_L',
      prompt: params.prompt,
      seed: params.seed ?? -1,
      return_url: true, // 请求返回图像URL而非base64数据
      ...(params.negative_prompt && { negative_prompt: params.negative_prompt })
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Date': timestamp,
      'Host': 'visual.volcengineapi.com'
    };

    const authorization = this.auth.signRequest(
      'POST',
      '/',
      'Action=CVProcess&Version=2022-08-31',
      headers,
      payload,
      timestamp
    );

    headers['Authorization'] = authorization;

    try {
      const response = await axios.post(
        `${this.baseUrl}/?Action=CVProcess&Version=2022-08-31`,
        payload,
        { headers }
      );

      // 处理实际的响应格式
      const data = response.data;
      
      console.log('=== 原始API响应 ===');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('==================');
      
      // 优先处理返回URL的响应格式
      if (data.code === 10000 && data.data) {
        // 如果有image_urls，直接使用
        if (data.data.image_urls && Array.isArray(data.data.image_urls) && data.data.image_urls.length > 0) {
          return {
            algorithm_base_resp: {
              status_code: 0,
              status_message: 'Success',
              request_id: data.request_id || 'unknown'
            },
            image_urls: data.data.image_urls,
            log_id: data.request_id || 'unknown'
          };
        }
        
        // 如果没有URL但有base64数据，转换为data URL（备用方案）
        if (data.data.binary_data_base64 && Array.isArray(data.data.binary_data_base64)) {
          console.warn('收到base64数据而非URL，可能需要设置return_url参数');
          const base64Images = data.data.binary_data_base64.map((base64: string, index: number) => 
            `data:image/png;base64,${base64}`
          );
          return {
            algorithm_base_resp: {
              status_code: 0,
              status_message: 'Success',
              request_id: data.request_id || 'unknown'
            },
            image_urls: base64Images,
            log_id: data.request_id || 'unknown'
          };
        }
      }
      
      // 如果响应格式不同，尝试适配
      if (data.ResponseMetadata || data.Result) {
        return {
          algorithm_base_resp: {
            status_code: data.ResponseMetadata?.Error?.Code || 0,
            status_message: data.ResponseMetadata?.Error?.Message || 'Success',
            request_id: data.ResponseMetadata?.RequestId || 'unknown'
          },
          image_urls: data.Result?.image_urls || [],
          log_id: data.ResponseMetadata?.RequestId || 'unknown'
        };
      }
      
      // 如果都不匹配，返回原始响应但添加默认结构
      return {
        algorithm_base_resp: {
          status_code: 0,
          status_message: 'Response format unknown',
          request_id: 'unknown'
        },
        image_urls: [],
        log_id: 'unknown',
        raw_response: data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        throw new Error(`API request failed: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}