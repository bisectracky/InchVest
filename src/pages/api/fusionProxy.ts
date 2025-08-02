// pages/api/fusionProxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PresetEnum } from "@1inch/cross-chain-sdk";

const TRON_CHAIN = 728126428;
const REAL_BASE  = "https://api.1inch.dev/fusion-plus";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // pathSegments = ["quoter","v1.0","quote","receive"]
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [];

  // Build the tail (e.g. "quoter/v1.0/quote/receive")
  const tail = segments.join("/");

  // 1️⃣ Intercept ONLY the GET‐quote call for Tron
  if (
    req.method === "GET" &&
    tail === "quoter/v1.0/quote/receive" &&
    Number(req.query.dstChain) === TRON_CHAIN
  ) {
    return res.status(200).json({
      quoteId:    "mock-" + Date.now(),
      srcChainId: Number(req.query.srcChain),
      dstChainId: Number(req.query.dstChain),
      srcToken:   { address: req.query.srcTokenAddress, decimals: 18 },
      dstToken:   { address: req.query.dstTokenAddress, decimals: 6 },
      amount:     req.query.amount,
      dstAmount:  req.query.amount,       // 1:1
      presets: {
        [PresetEnum.fast]: {
          secretsCount: 1,
          estimatedFee: "0"
        }
      },
      source: req.query.source || "mock"
    });
  }

  // 2️⃣ Otherwise, forward everything to the real Fusion+ endpoint
  //    Reconstruct path+query  
  const url =
    REAL_BASE +
    "/" +
    tail +
    (req.method === "GET" && Object.keys(req.query).length > 1
      ? "?" +
        Object.entries(req.query)
          .filter(([k]) => k !== "path")
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(
                Array.isArray(v) ? v.join(",") : v!
              )}`
          )
          .join("&")
      : "");

  const fetchOpts: any = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
    },
  };
  if (req.method !== "GET") {
    fetchOpts.body = JSON.stringify(req.body);
  }

  const upstream = await fetch(url, fetchOpts);
  const text     = await upstream.text();
  res.status(upstream.status).end(text);
}
