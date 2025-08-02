// hardhat/scripts/deployResolverManual.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// load the project-root .env to pull in your Tron-escrow address
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  // ─── 1) Load the Resolver artifact ─────────────────────────────────────────
  const artPath = path.resolve(
    __dirname,
    "../../tronContracts/build/contracts/Resolver.json"
  );
  if (!fs.existsSync(artPath)) {
    console.error("❌ Cannot find Resolver.json at", artPath);
    process.exit(1);
  }
  const art     = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const abi     = art.abi;
  let bytecode  =
    typeof art.bytecode === "object" ? art.bytecode.object : art.bytecode;
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // ─── 2) Read your Sepolia-escrow & Tron-escrow addresses ────────────────────
  const deployedPath = path.resolve(__dirname, "../deployedAddresses.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("❌ deployedAddresses.json not found – deploy Sepolia escrow first");
    process.exit(1);
  }
  const deployed   = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  const srcEscrow  = deployed.Sepolia_EscrowFactory?.address;
  const lop  = deployed.LimitOrderProtocol?.address;
  if (!srcEscrow || !lop) {
    console.error(
      "❌ Missing Sepolia_EscrowFactory in deployedAddresses.json or DST_CHAIN_ESCROW_FACTORY in .env"
    );
    process.exit(1);
  }
  console.log("🔗 srcEscrow (Sepolia):", srcEscrow);
  console.log("🔗 lop (Sepolia):", lop);

  // ─── 3) Deploy CrossChainResolver ───────────────────────────────────────────
  const [deployer] = await ethers.getSigners();
  const owner      = await deployer.getAddress();
  console.log("🚀 Deploying CrossChainResolver as", owner);

  const factory  = new ethers.ContractFactory(abi, bytecode, deployer);
  const resolver = await factory.deploy(srcEscrow, lop, deployer);
  await resolver.waitForDeployment();

  const resolverAddr = await resolver.getAddress();
  const network      = (await ethers.provider.getNetwork()).name;
  console.log(`✅ CrossChainResolver deployed at ${resolverAddr} on ${network}`);

  // ─── 4) Persist it ──────────────────────────────────────────────────────────
  deployed.Sepolia_Resolver = { address: resolverAddr, network };
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("💾 Updated", deployedPath);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
