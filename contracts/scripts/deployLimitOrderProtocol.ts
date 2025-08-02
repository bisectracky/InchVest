// scripts/deployLOP.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
const _pkg = require("tronweb");

// explicitly load the project-root .env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const fullHost   = process.env.TRON_FULL_HOST;
const privateKey = process.env.TRON_PRIVATE_KEY;
if (!fullHost || !privateKey) {
  console.error("❌ Please set TRON_FULL_HOST and TRON_PRIVATE_KEY in your .env");
  process.exit(1);
}

// ─── load the compiled LimitOrderProtocol artifact ───────────────────────────
const artPath = path.join(
  __dirname,
  "../build/contracts/LimitOrderProtocol.json"     // ← was OrderMixin.json
);
const artifact = JSON.parse(fs.readFileSync(artPath, "utf8"));
const abi      = artifact.abi;
const rawCode  =
  typeof artifact.bytecode === "object"
    ? artifact.bytecode.object
    : artifact.bytecode;
if (!rawCode) {
  console.error("❌ Could not find bytecode in LimitOrderProtocol artifact");
  process.exit(1);
}
const bytecode = rawCode.startsWith("0x") ? rawCode.slice(2) : rawCode;

// ─── grab your deployed WETH9 address ────────────────────────────────────────
const deployedPath = path.join(__dirname, "deployedAddresses.json");
if (!fs.existsSync(deployedPath)) {
  console.error("❌ deployedAddresses.json not found. Deploy WETH9 first!");
  process.exit(1);
}
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
const wethHex = deployed.WETH9?.hex;
if (!wethHex) {
  console.error("❌ No WETH9 entry in deployedAddresses.json");
  process.exit(1);
}

async function main() {
  const TronWebClass =
    (_pkg.default && typeof _pkg.default === "function" && _pkg.default) ||
    (_pkg.TronWeb && typeof _pkg.TronWeb === "function" && _pkg.TronWeb) ||
    (typeof _pkg === "function" && _pkg);
  const tronWeb = new TronWebClass({ fullHost, privateKey });

  console.log("🚀 Deploying LimitOrderProtocol with WETH9:", wethHex);
  const instance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [wethHex],   // only one constructor arg
    feeLimit:   1_000_000_000,
    callValue:  0,
  });

  const hexAddr    = instance.address;
  const base58Addr = tronWeb.address.fromHex(hexAddr);
  console.log("✅ LimitOrderProtocol deployed at (hex):    ", hexAddr);
  console.log("✅ LimitOrderProtocol deployed at (base58):", base58Addr);

  // save it
  deployed.LimitOrderProtocol = { hex: hexAddr, base58: base58Addr };  // ← renamed key
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("💾 Updated deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
