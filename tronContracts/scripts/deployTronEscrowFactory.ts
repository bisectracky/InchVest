// scripts/deployTronEscrowFactory.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
const TronWebPkg = require("tronweb");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  // ─── load env ────────────────────────────────────────────────────────────────
  const fullHost  = process.env.TRON_FULL_HOST;
  const privateKey= process.env.TRON_PRIVATE_KEY;
  const LOP       = process.env.DST_CHAIN_LOP;           // Tron LOP
  const FEE       = process.env.DST_CHAIN_FEE_TOKEN;    // feeToken on Tron
  const ACCESS    = process.env.DST_CHAIN_ACCESS; // accessToken on Tron

  if (!fullHost || !privateKey || !LOP || !FEE || !ACCESS) {
    console.error("❌ Set TRON_FULL_HOST, TRON_PRIVATE_KEY, DST_CHAIN_LOP_ADDRESS, DST_CHAIN_FEE_TOKEN_ADDRESS and DST_CHAIN_ACCESS_TOKEN_ADDRESS in .env");
    process.exit(1);
  }

  // ─── setup TronWeb ───────────────────────────────────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
  const tronWeb = new TronWebClass({ fullHost, privateKey });

  // ─── load TestEscrowFactory artifact ────────────────────────────────────────
  const artPath = path.resolve(__dirname, "../build/contracts/TestEscrowFactory.json");
  if (!fs.existsSync(artPath)) {
    console.error("❌ Cannot find TestEscrowFactory.json at", artPath);
    process.exit(1);
  }
  const art      = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const abi      = art.abi;
  let bytecode   = typeof art.bytecode === "object" ? art.bytecode.object : art.bytecode;
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // ─── deploy EscrowFactory ───────────────────────────────────────────────────
  const ownerHex = tronWeb.defaultAddress.hex;
  console.log("👤 Owner (hex):", ownerHex);
  console.log("🚀 Deploying TestEscrowFactory on Tron Nile…");

  const factoryInstance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [
      LOP,       // LimitOrderProtocol on Tron
      FEE,       // feeToken
      ACCESS,    // accessToken
      ownerHex,  // owner
      3600,      // rescueDelaySrc (in seconds)
      3600       // rescueDelayDst
    ],
    feeLimit: 1_000_000_000,
    callValue: 0,
  });

  console.log("✅ EscrowFactory deployed (hex):   ", factoryInstance.address);
  console.log("✅ EscrowFactory deployed (base58):", tronWeb.address.fromHex(factoryInstance.address));

  // ─── persist address ─────────────────────────────────────────────────────────
  const outPath = path.resolve(__dirname, "deployedAddresses.json");
  const db: any = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};
  db.Tron_EscrowFactory = {
    hex:    factoryInstance.address,
    base58: tronWeb.address.fromHex(factoryInstance.address),
  };
  fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
  console.log("💾 Saved Tron_EscrowFactory to", outPath);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
