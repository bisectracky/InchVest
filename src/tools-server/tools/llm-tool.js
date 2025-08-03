// src/tools/llm-tool.js
import { OpenAI } from 'openai';
import 'dotenv/config';

//const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


export class LLMTool {
  constructor({ apiKey, model = 'gpt-4' }) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }
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

export async function callLLM({ prompt }) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  return stream;
}


export const handler = {
  async call({ prompt }) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    return response;
  }
};