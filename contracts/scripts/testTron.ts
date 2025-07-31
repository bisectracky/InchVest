import "dotenv/config";
import TronProviderConnector from "../utils/TronProviderConnector";

(async () => {
    try {
        const privateKey = process.env.PRIVATE_KEY_SHASTA as string;
        if (!privateKey) {
            throw new Error("Missing PRIVATE_KEY_SHASTA in .env file");
        }

        const rpcUrl = "https://api.shasta.trongrid.io";
        const tron = new TronProviderConnector(privateKey, rpcUrl);

        const address = await tron.getAddress();
        console.log("✅ Wallet Address:", address);

        const balance = await tron.getBalance();
        console.log("💰 Balance:", balance, "TRX");
    } catch (error) {
        console.error("❌ Error running test script:", error);
    }
})();
