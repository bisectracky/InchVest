// pages/api/fusionSwap.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  HashLock,
  NetworkEnum,
  PresetEnum,
  PrivateKeyProviderConnector,
  SDK,
} from "@1inch/cross-chain-sdk";
import Web3 from "web3";
import { randomBytes } from "crypto";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const privateKey = process.env.PRIVATE_KEY as string;
    const rpc = process.env.RPC_URL as string;
    const authKey = process.env.DEV_PORTAL_API_KEY as string;
    const source = "sdk-tutorial";

    const web3 = new Web3(rpc) as unknown as any;
    const walletAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;

    const sdk = new SDK({
      url: "https://api.1inch.dev/fusion-plus",
      authKey,
      blockchainProvider: new PrivateKeyProviderConnector(privateKey, web3),
    });


    // Helper: Get fresh quote
    const getQuote = async () => {
      return await sdk.getQuote({
        amount: "5500000000000000", // 0.01 ETH
        srcChainId: NetworkEnum.ARBITRUM,
        dstChainId: NetworkEnum.ETHEREUM,
        enableEstimate: true,
        srcTokenAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on ARB
        dstTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on ETH
        walletAddress,
      });
    };

const attemptSwap = async () => {
  const quote = await getQuote();
  const preset = PresetEnum.fast;

  console.log("DEBUG: Got Quote", { quoteId: quote.quoteId });

  // Generate secrets
  const secrets = Array.from({ length: quote.presets[preset].secretsCount }).map(
    () => "0x" + randomBytes(32).toString("hex")
  );
  const secretHashes = secrets.map((s) => HashLock.hashSecret(s));
  const hashLock =
    secrets.length === 1
      ? HashLock.forSingleFill(secrets[0])
      : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

  try {
    // 🔥 Replace createOrder+submitOrder with placeOrder
    const { orderHash } = await sdk.placeOrder(quote, {
      walletAddress,
      hashLock,
      secretHashes
    });

    console.log("✅ Order Placed:", orderHash);
    return { success: true, hash: orderHash };

  } catch (err: any) {
    console.error("❌ placeOrder failed:", {
      message: err.message,
      responseData: err.response?.data,
    });
    return { success: false, error: err };
  }
};

    // First attempt
    let result = await attemptSwap();

    // Retry once if 400 Invalid order
    if (!result.success && result.error?.response?.status === 400) {
      console.log("⚠️ Retrying with a fresh quote...");
      result = await attemptSwap();
    }

    if (!result.success) {
      throw result.error;
    }

    return res.status(200).json({ orderHash: result.hash });

  } catch (err: any) {
console.error("❌ submitOrder failed:", {
  message: err.message,
  responseData: err.response?.data,
  meta: JSON.stringify(err.response?.data?.meta, null, 2),
});
    return res.status(500).json({ error: err.message, details: err.response?.data });
  }
}
