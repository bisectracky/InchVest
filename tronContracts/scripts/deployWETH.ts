// scripts/deployMockERC20.ts
import fs from "fs";
import path from "path";
const TronWebPkg = require("tronweb");
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const fullHost   = process.env.TRON_FULL_HOST;
const privateKey = process.env.TRON_PRIVATE_KEY;
if (!fullHost || !privateKey) {
  console.error("❌ Please set TRON_FULL_HOST and TRON_PRIVATE_KEY in your .env");
  process.exit(1);
}

// load your compiled artifact
const artifactPath = path.join(__dirname, "../build/contracts/MockERC20.json");
if (!fs.existsSync(artifactPath)) {
  console.error("❌ Could not find MockERC20.json at", artifactPath);
  process.exit(1);
}
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi      = artifact.abi as any[];
const rawCode  =
  typeof artifact.bytecode === "object"
    ? artifact.bytecode.object as string
    : artifact.bytecode as string;
if (!rawCode) {
  console.error("❌ Could not find bytecode in MockERC20 artifact");
  process.exit(1);
}
const bytecode = rawCode.startsWith("0x") ? rawCode.slice(2) : rawCode;

// pick the correct TronWeb constructor
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
const tronWeb = new TronWebClass({ fullHost, privateKey });

async function main() {
  console.log("🚀 Deploying MockERC20 to Tron...");

  const instance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [
      "Wrapped Ether",                         // name
      "WETH",                                  // symbol
      "1000" + "0".repeat(18)                  // initial supply = 1000 * 10^18
    ],
    feeLimit:   1_000_000_000,
    callValue:  0,
  });

  const hexAddress    = instance.address;
  const base58Address = tronWeb.address.fromHex(hexAddress);

  console.log("✅ Deployed MockERC20 at (hex):    ", hexAddress);
  console.log("✅ Deployed MockERC20 at (base58): ", base58Address);

  // persist to deployedAddresses.json
  const outPath = path.join(__dirname, "deployedAddresses.json");
  let all: any = {};
  if (fs.existsSync(outPath)) {
    all = JSON.parse(fs.readFileSync(outPath, "utf8"));
  }
  all.MockERC20 = { hex: hexAddress, base58: base58Address };
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log("💾 Saved MockERC20 to deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Deployment failed:", e);
    process.exit(1);
  });
