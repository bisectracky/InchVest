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
        const status = await sdk.getOrderStatus("0xa50cf33dd60be87aafa95a0d3c280165f759f480a5b5fc52bcfeccd13424a009");

        res.status(200).json(status);
    } catch (error) {
        console.error("Fusion Status Error:", error);
        res.status(500).json({ error: "Failed to fetch order status" });
    }
}