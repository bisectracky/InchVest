// pages/api/tronFusionSwap.ts

import type { NextApiRequest, NextApiResponse } from "next";
import {
  HashLock,
  NetworkEnum,
  PresetEnum,
  PrivateKeyProviderConnector,
  SDK,
} from "@1inch/cross-chain-sdk";
import Web3 from "web3";
import TronProviderConnector from "../../../contracts/utils/TronProviderConnector";
import { randomBytes } from "crypto";
import type { SupportedChain } from "@1inch/cross-chain-sdk";

const ETH_CHAIN  = NetworkEnum.ETHEREUM;
const TRON_CHAIN = 728126428;     // your ad-hoc Tron chain ID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // ────────────────────────────────────────────────────────────────────────
    // 1️⃣ Load env vars & build our two low-level connectors
    // ────────────────────────────────────────────────────────────────────────
    const ethKey     = process.env.PRIVATE_KEY!;
    const ethRpc     = process.env.RPC_URL!;
    const tronKey    = process.env.TRON_PRIVATE_KEY!;
    const tronRpc    = process.env.TRON_RPC_URL!;
    const htlcOnTron = process.env.HTLC_ADDRESS_TRON!;
    const authKey    = process.env.DEV_PORTAL_API_KEY!;

    if (!ethKey || !ethRpc || !tronKey || !tronRpc || !htlcOnTron || !authKey) {
      throw new Error("Missing required environment variables");
    }

    // Ethereum-side connector (for quote + later does nothing on-chain)
    const ethWeb3       = new Web3(ethRpc) as unknown as any;
    const ethWallet     = ethWeb3.eth.accounts.privateKeyToAccount(ethKey).address;
    const evmConnector  = new PrivateKeyProviderConnector(ethKey, ethWeb3);

    // Tron-side connector (for on-chain HTLC calls)
    const tronConnector = new TronProviderConnector(tronKey, tronRpc);

    // ────────────────────────────────────────────────────────────────────────
    // 2️⃣ Instantiate ONE Fusion+ SDK and inject custom Tron network
    // ────────────────────────────────────────────────────────────────────────
const fusion = new SDK({
  url:                "https://api.1inch.dev/fusion-plus",
  authKey:            process.env.DEV_PORTAL_API_KEY,
  blockchainProvider: evmConnector,   // for getQuote
});

// tell the SDK about our ad-hoc Tron chain
;(fusion as any).config = {
  ...((fusion as any).config),
  networks: {
    // keep all of the built-in EVM chains…
    ...((fusion as any).config.networks),
    // …then add Tron
    [TRON_CHAIN]: {
      chainId:     TRON_CHAIN,
      rpc:         tronRpc,
      htlc:        htlcOnTron,
      nativeToken: {
        address:  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 6,
      },
    },
  },
};

    // ────────────────────────────────────────────────────────────────────────
    // 3️⃣ Get your ETH → TRON quote
    // ────────────────────────────────────────────────────────────────────────
    const quote = await fusion.getQuote({
      amount:           "5000000000000000000",      // 5 USDC (18-decimals) on ETH
      srcChainId:       ETH_CHAIN,
      dstChainId:       TRON_CHAIN as unknown as SupportedChain,
      enableEstimate:   true,
      srcTokenAddress:  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on ETH
      dstTokenAddress:  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // TRX on Tron
      walletAddress:    ethWallet,
    });
;(fusion as any).blockchainProvider = tronConnector;
    // ────────────────────────────────────────────────────────────────────────
    // 4️⃣ Build the HTLC lock parameters: secrets + hashLock
    // ────────────────────────────────────────────────────────────────────────
    const preset       = PresetEnum.fast;
    const secrets      = Array.from(
      { length: quote.presets[preset].secretsCount },
      () => "0x" + randomBytes(32).toString("hex")
    );
    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

    const hashLock =
      secrets.length === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

    // ────────────────────────────────────────────────────────────────────────
    // 5️⃣ Switch the SDK over to Tron for the placeOrder + secret submits
    // ────────────────────────────────────────────────────────────────────────
const fusionAny = fusion as any;
fusionAny.blockchainProvider = tronConnector;

    // 6️⃣ Place your cross-chain order (TRON HTLC.lock transaction)
    const { orderHash } = await fusion.placeOrder(quote, {
      walletAddress: ethWallet,
      hashLock,
      secretHashes,
      preset,
      source:        "tron-fusion",
    });
    console.log("✅ Order placed:", orderHash);

    // ────────────────────────────────────────────────────────────────────────
    // 7️⃣ Poll on Tron for fills, submit secrets when ready
    // ────────────────────────────────────────────────────────────────────────
    const pollId = setInterval(async () => {
      try {
        const order = await fusion.getOrderStatus(orderHash);
        if (order.status === "executed") {
          console.log("🎉 Swap executed!");
          clearInterval(pollId);
          return;
        }

        const { fills } = await fusion.getReadyToAcceptSecretFills(orderHash);
        for (const fill of fills) {
          await fusion.submitSecret(orderHash, secrets[fill.idx]);
          console.log(`🔑 Secret #${fill.idx} submitted`);
        }
      } catch (err: any) {
        console.warn("Polling error:", err.message);
      }
    }, 5_000);

    // ────────────────────────────────────────────────────────────────────────
    // 8️⃣ Respond immediately with the orderHash
    // ────────────────────────────────────────────────────────────────────────
    return res.status(200).json({ orderHash });
  } catch (err: any) {
    console.error("tronFusionSwap failed:", err);
    return res
      .status(500)
      .json({ error: err.message || "Unknown error" });
  }
}
