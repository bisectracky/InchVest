// pages/api/fusionProxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PresetEnum } from "@1inch/cross-chain-sdk";

const TRON_CHAIN = 728126428;
const REAL_BASE  = "https://api.1inch.dev/fusion-plus";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = Array.isArray(req.query.path) ? req.query.path : [];
  const tail     = segments.join("/");

  // 🚧 Intercept the exact GET‐quote URL for Tron
  if (
    req.method === "GET" &&
    tail === "quoter/v1.0/quote/receive" &&
    Number(req.query.dstChain) === TRON_CHAIN
  ) {
    const srcChain = Number(req.query.srcChain);
    const dstChain = Number(req.query.dstChain);
    const amount   = String(req.query.amount);
    const srcTok   = String(req.query.srcTokenAddress);
    const dstTok   = String(req.query.dstTokenAddress);

    return res.status(200).json({
      quoteId:    "mock-" + Date.now(),
      srcChainId: srcChain,
      dstChainId: dstChain,
      srcToken:   { address: srcTok, decimals: 18 },
      dstToken:   { address: dstTok, decimals: 6 },
      amount,           // e.g. "5000000000000000000"
      dstAmount:  amount, // for 1:1 mock
      presets: {
        [PresetEnum.fast]: {
          secretsCount:  1,
          estimatedFee: "0",
        },
      },
      source: "mock",
    });
  }

  // otherwise proxy through to the real Fusion+ API…
  // (your existing forwarding code here)
}
