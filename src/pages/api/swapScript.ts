import dotenv from "dotenv";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

console.log("🚀 SwapScript loaded. Starting config check...");

const requiredEnvVars = ["WALLET_ADDRESS", "PRIVATE_KEY", "DEV_PORTAL_API_KEY", "RPC_URL"];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

console.log("✅ Environment variables loaded");

const config = {
  walletAddress: process.env.WALLET_ADDRESS!.toLowerCase(),
  privateKey: process.env.PRIVATE_KEY! as Hex,
  apiKey: process.env.DEV_PORTAL_API_KEY!,
  rpcUrl: process.env.RPC_URL!,
  tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  amountToSwap: 10_000, // 0.01 USDC
  dstToken: "0x4200000000000000000000000000000000000006", // WETH on Base
  slippage: 1,
};

const baseUrl = `https://api.1inch.dev/swap/v6.1/${base.id}`;

const publicClient = createPublicClient({
  chain: base,
  transport: http(config.rpcUrl),
});

const account = privateKeyToAccount(config.privateKey);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(config.rpcUrl),
});

function buildQueryURL(path: string, params: Record<string, string>): string {
  const url = new URL(baseUrl + path);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

async function call1inchAPI<T>(endpointPath: string, queryParams: Record<string, string>): Promise<T> {
  const url = buildQueryURL(endpointPath, queryParams);
  console.log(`🌐 Calling 1inch API: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  const body = await response.text();

  if (!response.ok) {
    console.error(`❌ 1inch API error (${response.status}):`, body);
    throw new Error(`1inch API returned status ${response.status}`);
  }

  console.log(`✅ 1inch API success (${endpointPath})`);
  return JSON.parse(body) as T;
}

async function signAndSendTransaction(tx: { to: Hex; data: Hex; value: bigint }): Promise<string> {
  console.log("📝 Preparing to sign transaction:", tx);

  const gas = await publicClient.estimateGas({
    account: config.walletAddress as Hex,
    to: tx.to,
    data: tx.data,
    value: BigInt(tx.value),
  });

  console.log("⛽ Gas estimated:", gas.toString());

  const latestBlock = await publicClient.getBlock();
  const baseFeePerGas = latestBlock.baseFeePerGas;

  const nonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: "pending",
  });

  console.log("🔢 Nonce:", nonce);

  let txHash: string;

  if (baseFeePerGas !== null && baseFeePerGas !== undefined) {
    const fee = await publicClient.estimateFeesPerGas();
    console.log("⛽ Using EIP-1559 fees:", fee);

    txHash = await walletClient.sendTransaction({
      account,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value),
      gas,
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
      chain: base,
      nonce,
      kzg: undefined,
    });
  } else {
    const gasPrice = await publicClient.getGasPrice();
    console.log("💰 Using legacy gas price:", gasPrice);

    txHash = await walletClient.sendTransaction({
      account,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value),
      gas,
      gasPrice,
      chain: base,
      nonce,
      kzg: undefined,
    });
  }

  console.log("✅ Transaction sent. Hash:", txHash);
  return txHash;
}

async function checkAllowance(): Promise<bigint> {
  console.log("🔍 Checking allowance...");
  const allowanceRes = await call1inchAPI<{ allowance: string }>("/approve/allowance", {
    tokenAddress: config.tokenAddress,
    walletAddress: config.walletAddress,
  });
  console.log("📜 Current allowance:", allowanceRes.allowance);
  return BigInt(allowanceRes.allowance);
}

async function approveIfNeeded(requiredAmount: bigint): Promise<void> {
  const allowance = await checkAllowance();

  if (allowance >= requiredAmount) {
    console.log("✅ Allowance sufficient, skipping approval.");
    return;
  }

  console.log("⚠️ Allowance insufficient. Requesting approval...");

  const approveTx = await call1inchAPI<{ to: Hex; data: Hex; value: bigint }>("/approve/transaction", {
    tokenAddress: config.tokenAddress,
    amount: requiredAmount.toString(),
  });

  console.log("📝 Approval transaction details:", approveTx);

  await signAndSendTransaction({
    to: approveTx.to,
    data: approveTx.data,
    value: approveTx.value,
  });

  console.log("✅ Approval transaction sent. Waiting 10s before swap...");
  await new Promise((res) => setTimeout(res, 10000));
}

async function performSwap(): Promise<string> {
  console.log("🔄 Performing token swap...");

  const swapParams = {
    src: config.tokenAddress,
    dst: config.dstToken,
    amount: config.amountToSwap.toString(),
    from: config.walletAddress,
    slippage: config.slippage.toString(),
    disableEstimate: "false",
    allowPartialFill: "false",
  };

  console.log("📦 Swap params:", swapParams);

  const swapTx = await call1inchAPI<{ tx: { to: Hex; data: Hex; value: bigint } }>("/swap", swapParams);
  console.log("📝 Swap transaction details:", swapTx);

  const txHash = await signAndSendTransaction(swapTx.tx);
  console.log("✅ Swap complete. Hash:", txHash);

  return txHash;
}

export async function runSwap() {
  console.log("🚀 runSwap started");
  await approveIfNeeded(BigInt(config.amountToSwap));
  console.log("✅ Approval stage completed, moving to swap...");
  const txHash = await performSwap();
  console.log("🎉 runSwap finished successfully. Hash:", txHash);
  return txHash;
}
