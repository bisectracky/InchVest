#!/usr/bin/env ts-node

import { ethers } from "hardhat"
import TronWebPkg from "tronweb"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"
import factoryJson from "../../tronContracts/build/contracts/TestEscrowFactory.json"
const TronWebPkg = require("tronweb");


dotenv.config({ path: path.resolve(__dirname, "../../.env") })

async function main() {
  // ── 0) pull in your env vars ───────────────────────────────────────────────
  const { 
    SEPOLIA_RPC_URL, PRIVATE_KEY, SEPOLIA_ESCROW_FACTORY, SEPOLIA_TOKEN,
    TRON_FULL_HOST, TRON_PRIVATE_KEY, TRON_RESOLVER
  } = process.env!
  if (!SEPOLIA_RPC_URL || !PRIVATE_KEY || !SEPOLIA_ESCROW_FACTORY || !SEPOLIA_TOKEN ||
      !TRON_FULL_HOST || !TRON_PRIVATE_KEY || !TRON_RESOLVER) {
    throw new Error("missing one of the env vars")
  }

  // ── 1) set up ethers + your factory + your mock-20 ────────────────────────
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider)
  const FactoryCF = new ethers.ContractFactory(
    factoryJson.abi,
    factoryJson.bytecode,
    wallet
  )
  const factory = FactoryCF.attach(SEPOLIA_ESCROW_FACTORY)
  const TokenCF = await ethers.getContractFactory("MockERC20", wallet)
  const token   = TokenCF.attach(SEPOLIA_TOKEN)

  // ── 2) approve 1 token for the HTLC ───────────────────────────────────────
  const amount = ethers.parseUnits("1.0", 18)
  await (await token.approve(factory.target, amount)).wait()
  console.log("✅ Sepolia: approved 1 token for HTLC")

  // ── 3) set up TronWeb + load your Resolver ABI ────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
  const tronWeb = new TronWebClass({ fullHost: TRON_FULL_HOST, privateKey: TRON_PRIVATE_KEY })
  const resolverJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../tronContracts/build/contracts/Resolver.json"), "utf8")
  )
  const resolver = await tronWeb.contract(resolverJson.abi, TRON_RESOLVER)

  console.log("🛠  setup done. 1 token approved on Sepolia; Tron resolver ready.")
  // ── next: generate secret/hashlock, call createHTLC, then resolver.resolve(...) ──
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
