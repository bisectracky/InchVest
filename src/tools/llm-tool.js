// tools/llm-tool.js
import { OpenAI } from 'openai';

class LLMTool {
  constructor({ apiKey, model = 'gpt-4' }) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async run({ prompt, role = "assistant", options = {} }) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: role },
          { role: "user", content: prompt }
        ],
        max_tokens: options.max_tokens || 800,
        temperature: options.temperature ?? 0.3
      });

      return {
        success: true,
        content: response.choices[0].message.content.trim(),
        metadata: {
          usage: response.usage,
          model: this.model
        }
      };
    } catch (error) {
      console.error('[LLMTool] Failed to call LLM:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default LLMTool;
