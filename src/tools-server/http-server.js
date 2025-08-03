// src/tools-server/http-server.js
import express from 'express';
import 'dotenv/config';
import { handler as llmHandler } from './tools/llm-tool.js';

const app = express();

app.use(express.json());

app.post('/tools/llm', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { prompt } = req.body;

    const stream = await llmHandler.stream({ prompt });

    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.write('event: end\ndata: done\n\n');
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify(err.message)}\n\n`);
    res.end();
  }
});

app.listen(3000, () => {
  console.log('Tool server listening on http://localhost:3000');
});