import { NextApiRequest, NextApiResponse } from "next";
import { SDK, NetworkEnum, HashLock, PrivateKeyProviderConnector } from "@1inch/cross-chain-sdk";
import Web3 from "web3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    try {
        const makerPrivateKey = process.env.PRIVATE_KEY!;
        const makerAddress = process.env.WALLET_ADDRESS!;
        const nodeUrl = process.env.RPC_URL!;

        const blockchainProvider = new PrivateKeyProviderConnector(
            makerPrivateKey,
            new Web3(nodeUrl) as unknown as any
        );

        const sdk = new SDK({
            url: "https://api.1inch.dev/fusion-plus",
            authKey: process.env.DEV_PORTAL_API_KEY,
            blockchainProvider,
        });
        const status = await sdk.getOrderStatus("0x8fd08f9d30e26fe922204266c3df4cf48cc208c5a9585c2148e1fa0a1d0becb6");

        res.status(200).json(status);
    } catch (error) {
        console.error("Fusion Status Error:", error);
        res.status(500).json({ error: "Failed to fetch order status" });
    }
}