// src/tools/llm-tool.js
import { OpenAI } from 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


export class LLMTool {
  constructor({ apiKey, model }) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async *stream({ prompt }) {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    for await (const part of stream) {
      yield part.choices[0]?.delta?.content || '';
    }
  }
}

export const handler = new LLMTool({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});
