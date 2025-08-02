// llm/OpenAILLM.js
import { OpenAI } from 'openai';

class OpenAILLM {
  constructor(apiKey, model = 'gpt-4') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(prompt, role = "assistant", options = {}) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: role },
        { role: "user", content: prompt }
      ],
      max_tokens: options.max_tokens || 800,
      temperature: options.temperature ?? 0.3
    });

    return response.choices[0].message.content.trim();
  }
}

export default OpenAILLM;