// pages/api/connectTron.ts
import { NextApiRequest, NextApiResponse } from "next";
import TronWeb from "tronweb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: process.env.TRON_PRIVATE_KEY
    });

    const address = tronWeb.defaultAddress.base58;
    const balance = await tronWeb.trx.getBalance(address);

    res.status(200).json({
        address,
        balance: balance / 1e6
    });
}
