#!/usr/bin/env ts-node

import { ethers } from "hardhat"
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
    TRON_FULL_HOST, TRON_PRIVATE_KEY, TRON_RESOLVER, TRON_TOKEN
  } = process.env!
  if (!SEPOLIA_RPC_URL || !PRIVATE_KEY || !SEPOLIA_ESCROW_FACTORY || !SEPOLIA_TOKEN ||
    !TRON_FULL_HOST || !TRON_PRIVATE_KEY || !TRON_RESOLVER) {
    throw new Error("missing one of the env vars")
  }

  // ── 1) set up ethers + your factory + your mock-20 ────────────────────────
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const FactoryCF = new ethers.ContractFactory(
    factoryJson.abi,
    factoryJson.bytecode,
    wallet
  )
  const factory = FactoryCF.attach(SEPOLIA_ESCROW_FACTORY)
  const TokenCF = await ethers.getContractFactory("MockERC20", wallet)
  const token = TokenCF.attach(SEPOLIA_TOKEN)

  // ── 2) approve 1 token for the HTLC ───────────────────────────────────────
  const amount = ethers.parseUnits("1.0", 18)
  await (await token.approve(factory.target, amount)).wait()
  console.log("✅ Sepolia: approved 1 token for HTLC")

  // ── 3) set up TronWeb + load your Resolver ABI ────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb && typeof TronWebPkg.TronWeb === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);
  const tronWeb = new TronWebClass({ fullHost: TRON_FULL_HOST, privateKey: TRON_PRIVATE_KEY })
  const resolverJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../tronContracts/build/contracts/Resolver.json"), "utf8")
  )
  const resolver = await tronWeb.contract(resolverJson.abi, TRON_RESOLVER)

 // ── 4) load the Tron‐side MockERC20 so we can check balances ─────────────
  const tronMockJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../tronContracts/build/contracts/MockERC20.json"), "utf8")
  )
  if (!TRON_TOKEN) throw new Error("Please set TRON_TOKEN in your .env")
  const tokenTron = await tronWeb.contract(tronMockJson.abi, TRON_TOKEN)

  // ── 4.1) fund the Tron resolver with 1 token & a bit of TRX for gas ─────
  //    (mimics the "dstChainResolver.topUpFromDonor" step in the 1inch test)
  if (typeof tokenTron.mint === "function") {
    console.log("💧 Minting 1 token to Tron resolver…")
    await tokenTron.mint(TRON_RESOLVER, amount).send()
  }
  console.log("⛽ Sending 1 TRX to Tron resolver for gas…")
  await tronWeb.trx.sendTransaction(TRON_RESOLVER, 1_000_000)


  // ── 5) record starting balances ─────────────────────────────────────────
  const meEvm  = await wallet.getAddress()
  const meTron = tronWeb.address.fromHex(tronWeb.defaultAddress.hex)
  const startEvm  = await token.balanceOf(meEvm)
  const startTron = await tokenTron.balanceOf(meTron).call()
  console.log(
    `⚖️  starting balances — Sepolia: ${ethers.formatUnits(startEvm,18)}  |  Tron: ${startTron}`
  )


 
  // ── 6) generate HTLC secret & hashlock ──────────────────────────────────
  const secretBytes = ethers.randomBytes(32)
  const secretHex   = ethers.hexlify(secretBytes)
  const hashlock    = ethers.keccak256(secretHex)
  console.log("🔐 secret:", secretHex)
  console.log("🧩 hashlock:", hashlock)

  // ── 7) lock your 1 token into Sepolia HTLC ──────────────────────────────
  // define where on Tron to send funds—and for how long
  const toTronAddr = tronWeb.defaultAddress.hex           // hex‐format of your Tron acct
  const now        = Math.floor(Date.now() / 1e3)
  const timelock   = now + 3600                            // 1h expiry
  console.log(`🚀 Locking ${ethers.formatUnits(amount,18)} token until ${timelock}`)

 // NB: use factory.address, not .target
  await (await token.approve(factory.target, amount)).wait()
  const lockTx   = await factory.createHTLC(
    toTronAddr,
    amount,
    timelock,
    { gasLimit: 5_000_000 }
  )
  const lockRcpt = await lockTx.wait()
  console.log("🔒 Locked on Sepolia, tx:", lockRcpt.transactionHash)

 // ── 8) grab the swapId from the emitted event ────────────────────────────
  const createdEvent = lockRcpt.events?.find(e => e.event === "HTLCCreated")
                      || lockRcpt.events![0]
  const swapId = createdEvent.args!.swapId.toHexString()
  console.log("🔑 swapId:", swapId)

  // ── 9) claim on Tron via your resolver ─────────────────────────────────
  console.log("🌉 Relaying to Tron resolver…")
  const claimTx = await resolver.resolve(swapId, secretHex).send()
  console.log("✅ Claimed on Tron, tx:", claimTx)

   // ── 10) record ending balances & verify ────────────────────────────────
  const endEvm   = await token.balanceOf(meEvm)
  const endTron  = await tokenTron.balanceOf(meTron).call()
  const movedEvm = startEvm.sub(endEvm)                   // BigNumber
  const movedTron = BigInt(endTron) - BigInt(startTron)   // BigInt
  console.log(
    `⚖️  ending balances — Sepolia: ${ethers.formatUnits(endEvm,18)}  |  Tron: ${endTron}`
  )
  console.log(`🔍 delta Sepolia: -${ethers.formatUnits(movedEvm,18)},  Tron: +${movedTron}`)

  if (movedEvm.eq(amount) && movedTron === 1n) {
    console.log("🎉 Single‐fill swap succeeded: exactly 1 token moved Sepolia→Tron.")
  } else {
    console.error("❌ Swap failed consistency check.")
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
