// deployWeth.ts
import fs from "fs";
import path from "path";
import TronWeb from "tronweb";
import dotenv from "dotenv";
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});
const _pkg = require("tronweb");

// ─── CONFIGURE THESE VIA .env ────────────────────────────────────────────────
// .env example:
//   TRON_FULL_HOST=https://nile.trongrid.io
//   TRON_PRIVATE_KEY=your_private_key_here
// ──────────────────────────────────────────────────────────────────────────────
const fullHost   = process.env.TRON_FULL_HOST;
const privateKey = process.env.TRON_PRIVATE_KEY;
if (!fullHost || !privateKey) {
  console.error("❌ Please set TRON_FULL_HOST and TRON_PRIVATE_KEY in your .env");
  process.exit(1);
}

// load your compiled artifact
const artifactPath = path.join(__dirname, "../build/contracts/WETH9.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi      = artifact.abi as any[];
const rawCode  =
  typeof artifact.bytecode === "object"
    ? artifact.bytecode.object as string
    : artifact.bytecode as string;
if (!rawCode) {
  console.error("❌ Could not find bytecode in WETH9 artifact");
  process.exit(1);
}
const bytecode = rawCode.startsWith("0x") ? rawCode.slice(2) : rawCode;

// set up TronWeb
const TronWebClass =
  (_pkg.default && typeof _pkg.default === "function" && _pkg.default) ||
  (_pkg.TronWeb && typeof _pkg.TronWeb === "function" && _pkg.TronWeb) ||
  (typeof _pkg === "function" && _pkg);
const tronWeb = new TronWebClass({ fullHost, privateKey });

async function main() {
  console.log("🚀 Deploying WETH9 to Tron...");

  const instance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [],    // constructor has no args
    feeLimit: 1_000_000_000,
    callValue: 0,
  });

  const hexAddress   = instance.address;
  const base58Address = tronWeb.address.fromHex(hexAddress);

  console.log("✅ Deployed WETH9 at (hex):    ", hexAddress);
  console.log("✅ Deployed WETH9 at (base58):", base58Address);

  // persist to deployedAddresses.json
  const outPath = path.join(__dirname, "deployedAddresses.json");
  let all: any = {};
  if (fs.existsSync(outPath)) {
    all = JSON.parse(fs.readFileSync(outPath, "utf8"));
  }
  all.WETH9 = { hex: hexAddress, base58: base58Address };
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log("💾 Saved addresses to deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Deployment failed:", e);
    process.exit(1);
  });
