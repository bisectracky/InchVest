#!/usr/bin/env ts-node
import { ethers } from "hardhat";
const TronWebPkg = require("tronweb");
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// ─── Load .env ────────────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Sepolia (EVM) settings
const SEP_RPC    = process.env.SEPOLIA_RPC_URL;
const SEP_KEY    = process.env.PRIVATE_KEY;
const FACTORY_E = process.env.SEPOLIA_ESCROW_FACTORY;       // from deployedAddresses.json
const TOKEN_E   = process.env.SEPOLIA_TOKEN;                // your MockERC20 on Sepolia

// Tron (Nile) settings
const TRON_FULL_HOST = process.env.TRON_FULL_HOST;
const TRON_KEY       = process.env.TRON_PRIVATE_KEY;
const RESOLVER_T     = process.env.TRON_RESOLVER;           // from deployedAddresses.json

if (
  !SEP_RPC ||
  !SEP_KEY ||
  !FACTORY_E ||
  !TOKEN_E ||
  !TRON_FULL_HOST ||
  !TRON_KEY ||
  !RESOLVER_T
) {
  console.error("❌ Missing one of the required .env vars:");
  console.error("   SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, SEPOLIA_ESCROW_FACTORY,");
  console.error("   SEPOLIA_TOKEN, TRON_FULL_HOST, TRON_PRIVATE_KEY, TRON_RESOLVER");
  process.exit(1);
}

async function main() {
  // ─── 1) Set up Ethers for Sepolia ──────────────────────────────────────────
  const sepProvider = new ethers.JsonRpcProvider(SEP_RPC);
  const sepWallet   = new ethers.Wallet(SEP_KEY!, sepProvider);

// 1) Load the TestEscrowFactory JSON
const jsonPath = path.resolve(
  __dirname,
  "../../tronContracts/build/contracts/TestEscrowFactory.json"
);
const json     = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const abi      = json.abi;
let bytecode   = typeof json.bytecode === "object"
  ? json.bytecode.object
  : json.bytecode;
if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

// 2) Build a factory from it
const factoryCF = new ethers.ContractFactory(abi, bytecode, sepWallet);

// 3) Attach to your deployed address
const factory   = factoryCF.attach(FACTORY_E!);

  const tokenCF   = await ethers.getContractFactory("MockERC20", sepWallet);
  const token     = tokenCF.attach(TOKEN_E!);


  console.log("🔑 Using EVM signer:", await sepWallet.getAddress());

  // ─── 2) Generate secret & hashlock ─────────────────────────────────────────
  const secretBytes = ethers.randomBytes(32);
  const secretHex   = ethers.hexlify(secretBytes);
  const hashlock    = ethers.keccak256(secretHex);
  console.log("🔐 secret:", secretHex);
  console.log("🧩 hashlock:", hashlock);

  // ─── 3) Approve factory to spend your token ────────────────────────────────
  const amount = ethers.parseUnits("1.0", 18);
  await (await token.approve(factory.target, amount)).wait();
  console.log("✅ Approved 1 token for HTLC");

  // ─── 4) Create the HTLC on Sepolia ────────────────────────────────────────
  const toTron   = sepWallet.address;            // we’ll claim back to ourselves
  const now      = Math.floor(Date.now() / 1e3);
  const timelock = now + 3600;                   // 1h expiry
  console.log(`🚀 Locking ${ethers.formatUnits(amount, 18)} tokens until ${timelock} …`);

  const lockTx   = await factory.createHTLC(
    toTron,
    amount,
    timelock,
    { gasLimit: 5_000_000 }
  );
  const receipt  = await lockTx.wait();
  const swapId   = receipt.logs[0].args!.swapId;   // first event’s swapId
  console.log("🔒 Locked on Sepolia, swapId =", swapId);

  // ─── 5) Set up TronWeb ────────────────────────────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
  const tronWeb  = new TronWebClass({ fullHost: TRON_FULL_HOST, privateKey: TRON_KEY });
  console.log("🔑 Using Tron signer:", tronWeb.address.fromHex(tronWeb.defaultAddress.hex));

  // ─── 6) Call resolve(...) on Tron ─────────────────────────────────────────
  const resolver = await tronWeb.contract().at(RESOLVER_T);
  console.log("🌉 Relaying to Tron resolver…");
  const claimTx   = await resolver.resolve(swapId, secretHex);
  console.log("✅ Claimed on Tron, tx:", claimTx);

  console.log("🎉 Swap complete: EVM→Tron flow succeeded!");
}

main().catch((err) => {
  console.error("❌ Demo failed:", err);
  process.exit(1);
});
