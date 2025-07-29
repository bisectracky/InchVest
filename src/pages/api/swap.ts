import type { NextApiRequest, NextApiResponse } from "next";
import { runSwap } from "./swapScript"; // adjust the path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔥 API endpoint /api/swap was called");

  try {
    if (req.method !== "POST") {
      console.warn("⚠️ Wrong method:", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log("🚀 Importing runSwap...");
    const { runSwap } = await import("./swapScript");

    console.log("🔄 Calling runSwap...");
    const txHash = await runSwap();

    console.log("✅ Swap finished:", txHash);
    return res.status(200).json({ success: true, txHash });
  } catch (err: any) {
    console.error("❌ API crashed:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
