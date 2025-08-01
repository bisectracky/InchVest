// Market Intelligence Agent - LLM Integration for InchVest
// Handles market data analysis, sentiment analysis, and trading insights
// When constructing the agents in your app:
/*
const marketIntel = new MarketIntelAgent({
  tools,
  rpcUrl: "...",
  openaiApiKey: process.env.OPENAI_API_KEY // optional if injected only via tool
}); 

And inside each agent constructor:

constructor(config) {
  this.tools = config.tools;
  this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
}
*/

import { OpenAI } from 'openai';
import { ethers } from 'ethers';
import OpenAILLM from '../llm/OpenAILLM';

class MarketIntelAgent {
  constructor(config) {
    this.llm = new OpenAILLM(config.openaiApiKey);
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.tools = config.tools; // Assuming tools is an instance of LLMTool or similar
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.isActive = false;
  }

  /**
   * Initialize the market intelligence agent
   */
  async initialize() {
    try {
      this.isActive = true;
      console.log('Market Intel Agent initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Market Intel Agent:', error);
      return false;
    }
  }

  /**
   * Analyze market sentiment using LLM
   * @param {string} marketData - Raw market data or news
   * @returns {Object} Sentiment analysis results
   */
  async analyzeSentiment(marketData) {
    if (!this.isActive) {
      throw new Error('Market Intel Agent not initialized');
    }

    try {
      const result = await this.tools.llm.run({
        prompt: marketSentimentPrompt(marketData),
        role: "You are a crypto market analyst...",
        options: { max_tokens: 500, temperature: 0.3 }
      });

      if (!result.success) throw new Error(result.error);
      const analysis = JSON.parse(result.content);

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  /**
   * Generate trading insights based on market conditions
   * @param {Object} marketConditions - Current market state
   * @returns {Object} Trading recommendations
   */
  async generateTradingInsights(marketConditions) {
    if (!this.isActive) {
      throw new Error('Market Intel Agent not initialized');
    }

    try {
      const prompt = `
        Market Conditions:
        - Price: ${marketConditions.price}
        - Volume: ${marketConditions.volume}
        - Volatility: ${marketConditions.volatility}
        - Trend: ${marketConditions.trend}
        
        Provide trading insights including:
        1. Risk assessment (low/medium/high)
        2. Opportunity score (0-100)
        3. Recommended actions
        4. Entry/exit points if applicable
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional crypto trading advisor. Provide clear, actionable trading insights based on market analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 750,
        temperature: 0.2
      });

      return {
        insights: response.choices[0].message.content,
        timestamp: Date.now(),
        marketConditions
      };
    } catch (error) {
      console.error('Error generating trading insights:', error);
      throw error;
    }
  }

  /**
   * Monitor market events and trigger alerts
   * @param {Array} watchlist - List of tokens to monitor
   * @returns {Array} Market alerts
   */
  async monitorMarket(watchlist) {
    if (!this.isActive) {
      throw new Error('Market Intel Agent not initialized');
    }

    const alerts = [];
    
    try {
      for (const token of watchlist) {
        // Fetch current market data (placeholder - integrate with actual API)
        const marketData = await this.fetchMarketData(token);
        
        // Analyze for significant changes
        const analysis = await this.analyzeSentiment(
          `Token: ${token}, Price Change: ${marketData.priceChange}%, Volume: ${marketData.volume}`
        );
        
        if (Math.abs(analysis.sentiment) > 0.7 || marketData.priceChange > 10) {
          alerts.push({
            token,
            type: analysis.sentiment > 0 ? 'bullish' : 'bearish',
            urgency: Math.abs(analysis.sentiment),
            message: `${token} showing ${analysis.sentiment > 0 ? 'positive' : 'negative'} sentiment`,
            timestamp: Date.now()
          });
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('Error monitoring market:', error);
      throw error;
    }
  }

  /**
   * Fetch market data for a specific token
   * @param {string} token - Token symbol
   * @returns {Object} Market data
   */
  async fetchMarketData(token) {
    // Placeholder - integrate with actual market data API
    // This could be CoinGecko, CoinMarketCap, or DeFi protocols
    return {
      symbol: token,
      price: 0,
      priceChange: 0,
      volume: 0,
      marketCap: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Stop the market intelligence agent
   */
  async stop() {
    this.isActive = false;
    console.log('Market Intel Agent stopped');
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      timestamp: Date.now()
    };
  }
}

export default MarketIntelAgent;
