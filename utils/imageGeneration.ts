import type { ImageGenerationConfig } from '../types';

export interface GeneratedImageResult {
  url?: string;
  b64Json?: string;
}

export async function generateImage(
  config: ImageGenerationConfig,
  prompt: string,
): Promise<GeneratedImageResult> {
  if (!config.enabled) {
    throw new Error('图片生成 API 未启用');
  }

  const baseUrl = String(config.baseUrl || '').replace(/\/+$/, '');
  const apiKey = String(config.apiKey || '').trim();
  const model = String(config.model || '').trim();

  if (!baseUrl || !apiKey || !model) {
    throw new Error('图片生成 API 配置不完整');
  }

  if (!prompt.trim()) {
    throw new Error('图片描述不能为空');
  }

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: prompt.trim(),
      n: 1,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `图片生成失败（HTTP ${response.status}）${text ? `：${text.slice(0, 500)}` : ''}`,
    );
  }

  const result = await response.json();
  const image = result?.data?.[0];

  if (!image) {
    throw new Error('图片生成 API 没有返回图片');
  }

  if (typeof image.url === 'string' && image.url.trim()) {
    return { url: image.url.trim() };
  }

  if (typeof image.b64_json === 'string' && image.b64_json.trim()) {
    return { b64Json: image.b64_json.trim() };
  }

  throw new Error('无法识别图片生成 API 返回的数据');
}
