// scripts/deployTronResolver.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
const TronWebPkg = require("tronweb");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  // ─── load env & persisted addresses ────────────────────────────────────────
  const fullHost  = process.env.TRON_FULL_HOST;
  const privateKey= process.env.TRON_PRIVATE_KEY;
  const dstEscrow = process.env.DST_CHAIN_ESCROW_FACTORY; // Sepolia factory, from your .env
  const addrPath  = path.resolve(__dirname, "deployedAddresses.json");

  if (!fs.existsSync(addrPath)) {
    console.error("❌ Missing deployedAddresses.json; run deployTronEscrowFactory first");
    process.exit(1);
  }
  const db        = JSON.parse(fs.readFileSync(addrPath, "utf8"));
  const lop = db.LimitOrderProtocol?.hex;

  if (!fullHost || !privateKey || !dstEscrow || !lop) {
    console.error("❌ Set TRON_FULL_HOST, TRON_PRIVATE_KEY, SRC_CHAIN_ESCROW_FACTORY in .env, and run the escrow factory deploy");
    process.exit(1);
  }

  // ─── setup TronWeb ───────────────────────────────────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
  const tronWeb = new TronWebClass({ fullHost, privateKey });

  const ownerHex = tronWeb.defaultAddress.hex;

  // ─── load Resolver artifact ───────────────────────────────────────────────────
  const artPath = path.resolve(__dirname, "../build/contracts/Resolver.json");
  if (!fs.existsSync(artPath)) {
    console.error("❌ Cannot find Resolver.json at", artPath);
    process.exit(1);
  }
  const art      = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const abi      = art.abi;
  let bytecode   = typeof art.bytecode === "object" ? art.bytecode.object : art.bytecode;
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // ─── deploy Resolver ─────────────────────────────────────────────────────────
  console.log("🚀 Deploying CrossChainResolver on Tron Nile…");
  const resolverInstance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [
      dstEscrow,    // Tron escrow factory
      lop,
      ownerHex
    ],
    feeLimit: 1_000_000_000,
    callValue: 0,
  });

  console.log("✅ Resolver deployed (hex):   ", resolverInstance.address);
  console.log("✅ Resolver deployed (base58):", tronWeb.address.fromHex(resolverInstance.address));

  // ─── persist address ─────────────────────────────────────────────────────────
  db.Tron_Resolver = {
    hex:    resolverInstance.address,
    base58: tronWeb.address.fromHex(resolverInstance.address),
  };
  fs.writeFileSync(addrPath, JSON.stringify(db, null, 2));
  console.log("💾 Saved Tron_Resolver to", addrPath);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
