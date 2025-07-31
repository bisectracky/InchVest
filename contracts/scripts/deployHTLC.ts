// scripts/deployHTLC.ts
import "dotenv/config";
import { keccak256 } from "web3-utils";

// Hunt for the real TronWeb constructor (ESM vs CJS)
const _pkg        = require("tronweb");
const TronWebClass =
  (_pkg.default && typeof _pkg.default === "function" && _pkg.default) ||
  (_pkg.TronWeb   && typeof _pkg.TronWeb   === "function" && _pkg.TronWeb) ||
  (typeof _pkg    === "function" && _pkg);

if (!TronWebClass) throw new Error("Cannot locate TronWeb constructor");

const artifact = require("../build/contracts/HTLC.json");

async function main() {
  // 1️⃣ Read + validate your env
  const fullHost   = "https://api.shasta.trongrid.io";
  const privateKey = "";
  const base58Beneficiary = "TXWeYg6uEiptmiT5owQJhqNrazPzHbAtMA";
  const secret            = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

  if (!fullHost || !privateKey || !base58Beneficiary || !secret) {
    throw new Error("Missing one of: TRON_FULL_HOST, PRIVATE_KEY_NILE, BENEFICIARY_T_ADDRESS, SWAP_SECRET");
  }

  // 2️⃣ Set up tronWeb
  const tronWeb = new TronWebClass({ fullHost, privateKey });

  // 3️⃣ Convert the beneficiary & build lock params
  const beneficiaryHex = tronWeb.address.toHex(base58Beneficiary);
  const hashlock       = keccak256(secret);
  const now            = Math.floor(Date.now()/1000);
  const timelock       = now + 5*60;     // +5 minutes

  console.log({ beneficiaryHex, hashlock, timelock });

  // 4️⃣ Deploy
  const instance = await tronWeb.contract().new({
    abi:        artifact.abi,
    bytecode:   artifact.bytecode,
    parameters: [beneficiaryHex, hashlock, timelock],
    feeLimit:   1_000_000_000,  // adjust if needed
    callValue:  1_000_000       // 1 TRX = 1e6 Sun
  });

  console.log("✅ HTLC deployed at", instance.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
