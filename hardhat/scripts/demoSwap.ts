#!/usr/bin/env ts-node

import { ethers } from "hardhat"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"
import factoryJson from "../../tronContracts/build/contracts/TestEscrowFactory.json"
const TronWebPkg = require("tronweb");
import * as Sdk from "@1inch/cross-chain-sdk"
import {
  computeAddress,
  ContractFactory,
  JsonRpcProvider,
  MaxUint256,
  parseEther,
  parseUnits,
  randomBytes,
  Wallet as SignerWallet
} from 'ethers'
import deployed from "../deployedAddresses.json"
import { ChainConfig, config } from '../config/config'
import {uint8ArrayToHex, UINT_40_MAX} from '@1inch/byte-utils'
import {
  Address
} from "@1inch/cross-chain-sdk"
import delay from "delay"
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

/**
 * Send a small TRX transfer, retrying on timeout.
 */
async function sendTrxWithRetry(
  tronWeb: any,
  to: string,
  amountSun: number,
  maxRetries = 5
): Promise<{ result: boolean; transaction?: any }> {
  let lastErr: any
  for (let attempt = 1; attempt <= maxRetries; ++attempt) {
    try {
      const tx = await tronWeb.trx.sendTransaction(to, amountSun)
      return { result: true, transaction: tx }
    } catch (err: any) {
      lastErr = err
      console.warn(`❗️ sendTransaction attempt ${attempt} failed: ${err.message}`)
      // exponential backoff: wait attempt * 500ms
      await delay(attempt * 500)
    }
  }
  // all retries exhausted
  throw new Error(
    `sendTransaction to ${to} failed after ${maxRetries} attempts: ${lastErr}`
  )
}

function tronHexToEvmHex(tronHex: string): string {
  // tronHex may come from tronWeb.address.toHex(base58) → "41XXXXXXXX…"
  if (!tronHex.match(/^41[0-9a-fA-F]{40}$/)) {
    throw new Error("Not a valid Tron hex-address: " + tronHex)
  }
  // drop the "41" version‐byte, prefix with "0x"
  return "0x" + tronHex.slice(2)
}

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
  await sendTrxWithRetry(tronWeb, TRON_RESOLVER, 1_000_000)


  // ── 5) record starting balances ─────────────────────────────────────────
  const meEvm = await wallet.getAddress()
  const meTron = tronWeb.address.fromHex(tronWeb.defaultAddress.hex)
  const startEvm = await token.balanceOf(meEvm)
  const startTron = await tokenTron.balanceOf(meTron).call()
  console.log(
    `⚖️  starting balances — Sepolia: ${ethers.formatUnits(startEvm, 18)}  |  Tron: ${startTron}`
  )



  // ── 6) generate HTLC secret & hashlock ──────────────────────────────────
  const secretBytes = ethers.randomBytes(32)
  const secretHex = ethers.hexlify(secretBytes)
  const hashlock = ethers.keccak256(secretHex)
  console.log("🔐 secret:", secretHex)
  console.log("🧩 hashlock:", hashlock)

  // ── 7) lock your 1 token into Sepolia HTLC ──────────────────────────────
  // define where on Tron to send funds—and for how long
  const toTronAddr = tronWeb.defaultAddress.hex           // hex‐format of your Tron acct
  const now = Math.floor(Date.now() / 1e3)
  const timelock = now + 3600                            // 1h expiry
  console.log(`🚀 Locking ${ethers.formatUnits(amount, 18)} token until ${timelock}`)


  // Here we trying to figure how to fill corssChain swap order
  const SEP_ESCROW_FACTORY = deployed.Sepolia_EscrowFactory.address;
  const SEP_RESOLVER = deployed.Sepolia_Resolver.address;
  const makerAddress = await wallet.getAddress()
  
  const srcChainId = config.chain.source.chainId
  const dstChainId = config.chain.destination.chainId
  const block = await provider.getBlock("latest")
  if (!block) {
    throw new Error("Could not fetch latest block")
  }
  const latestTimestamp: bigint = BigInt(block.timestamp)
const TRON_TOKEN_EVM_FORMAT   = tronHexToEvmHex('4175155f4d9e0bcd3c974670c901b48ebc04af1721')
  //Declaring a new order

  const order = Sdk.CrossChainOrder.new(
    new Address(SEP_ESCROW_FACTORY),
    {
      salt: Sdk.randBigInt(1000n),
      maker: new Address(makerAddress),
      makingAmount: parseUnits('5', 6),
      takingAmount: parseUnits('3', 6),
      makerAsset: new Address('0xB7eB8AdD336A42FBf5022a0767a579EA54a39177'),
      takerAsset: new Address('0x75155f4d9e0bcd3c974670c901b48ebc04af1721')
    },
    {
      hashLock: Sdk.HashLock.forSingleFill(secretHex),
      timeLocks: Sdk.TimeLocks.new({
        srcWithdrawal: 10n, // 10sec finality lock for test
        srcPublicWithdrawal: 120n, // 2m for private withdrawal
        srcCancellation: 121n, // 1sec public withdrawal
        srcPublicCancellation: 122n, // 1sec private cancellation
        dstWithdrawal: 10n, // 10sec finality lock for test
        dstPublicWithdrawal: 100n, // 100sec private withdrawal
        dstCancellation: 101n // 1sec public withdrawal
      }),
      srcChainId,
      dstChainId,
      srcSafetyDeposit: parseEther('0.001'),
      dstSafetyDeposit: parseEther('0.001')
    },
    {
      auction: new Sdk.AuctionDetails({
        initialRateBump: 0,
        points: [],
        duration: 120n,
        startTime: latestTimestamp
      }),
      whitelist: [
        {
          address: new Address(SEP_RESOLVER),
          allowFrom: 0n
        }
      ],
      resolvingStartTime: 0n
    },
    {
      nonce: Sdk.randBigInt(UINT_40_MAX),
      allowPartialFills: false,
      allowMultipleFills: false
    }
  )

  const signature = await makerAddress.signOrder(srcChainId, order)

  console.log("IS IT WORKING!!!?!?!?!?", order)
  // NB: use factory.address, not .target
  await (await token.approve(factory.target, amount)).wait()
  const lockTx = await factory.deploy(
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
  const endEvm = await token.balanceOf(meEvm)
  const endTron = await tokenTron.balanceOf(meTron).call()
  const movedEvm = startEvm.sub(endEvm)                   // BigNumber
  const movedTron = BigInt(endTron) - BigInt(startTron)   // BigInt
  console.log(
    `⚖️  ending balances — Sepolia: ${ethers.formatUnits(endEvm, 18)}  |  Tron: ${endTron}`
  )
  console.log(`🔍 delta Sepolia: -${ethers.formatUnits(movedEvm, 18)},  Tron: +${movedTron}`)

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
