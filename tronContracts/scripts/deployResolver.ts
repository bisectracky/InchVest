import fs   from "fs";
import path from "path";
import TronWeb from "tronweb";
const _pkg = require("tronweb");
import dotenv from "dotenv";
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// your Truffle-style artifact (built by Forge)
const artifactPath = path.join(__dirname, "../build/contracts/Resolver.json");
const artifact: {
  abi: any[];
  bytecode: { object: string } | string;
  deployedBytecode?: { object: string } | string;
  [k: string]: any;
} = require(artifactPath);

// ─── CONFIGURE THESE ───────────────────────────────────────────────────────────
const fullHost   = process.env.TRON_FULL_HOST;
const privateKey = process.env.TRON_PRIVATE_KEY;
// ────────────────────────────────────────────────────────────────────────────────

// pick the correct TronWeb constructor
const TronWebClass =
  (_pkg.default && typeof _pkg.default === "function" && _pkg.default) ||
  (_pkg.TronWeb && typeof _pkg.TronWeb === "function" && _pkg.TronWeb) ||
  (typeof _pkg === "function" && _pkg);
const tronWeb = new TronWebClass({ fullHost, privateKey });

async function main() {
  // 1️⃣ extract the raw hex string
  const rawBytecode =
    // Forge v2+ puts it under .object, older might be raw string
    typeof artifact.bytecode === "object"
      ? artifact.bytecode.object
      : artifact.bytecode;

  if (!rawBytecode || typeof rawBytecode !== "string") {
    throw new Error("Could not find bytecode.object in artifact");
  }

  // 2️⃣ strip any leading "0x" (TronWeb wants bare hex)
  const tronBytecode = rawBytecode.startsWith("0x")
    ? rawBytecode.slice(2)
    : rawBytecode;

  console.log("👉 Raw bytecode snippet:", tronBytecode.slice(0, 20), "…");
  console.log("👉 Full bytecode length:", tronBytecode.length, "hex chars");

  // 3️⃣ deploy
  console.log("🚀 Sending deploy transaction...");
  const instance = await tronWeb.contract().new({
    abi:        artifact.abi,
    bytecode:   tronBytecode,
    parameters: [],          // constructor args if any
    feeLimit:   1_000_000_000,
    callValue:  0,
  });

  // 4️⃣ report back
  console.log("✅ Deployed! Contract address (hex):     ", instance.address);
  console.log("✅ Deployed! Contract address (base58): ", tronWeb.address.fromHex(instance.address));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
