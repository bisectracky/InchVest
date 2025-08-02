// hardhat/scripts/deployEscrowFactoryManual.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // ─── 1) Load the TestEscrowFactory artifact ────────────────────────────────
  const artPath = path.resolve(
    __dirname,
    "../../tronContracts/build/contracts/TestEscrowFactory.json"
  );
  if (!fs.existsSync(artPath)) {
    console.error("❌ Cannot find TestEscrowFactory.json at", artPath);
    process.exit(1);
  }
  const art     = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const abi     = art.abi;
  let bytecode  =
    typeof art.bytecode === "object" ? art.bytecode.object : art.bytecode;
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // ─── 2) Read your deployed LOP & MockERC20 addresses ───────────────────────
  const deployedPath = path.resolve(__dirname, "../deployedAddresses.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("❌ deployedAddresses.json not found – deploy LOP & MockERC20 first");
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  const lopAddr   = deployed.LimitOrderProtocol?.address;
  const feeToken  = deployed.MockERC20?.address;
  const accessTok = deployed.MockERC20?.address;
  if (!lopAddr || !feeToken || !accessTok) {
    console.error("❌ Missing LimitOrderProtocol or MockERC20 in deployedAddresses.json");
    process.exit(1);
  }
  console.log("🔗 LOP:", lopAddr, " feeToken:", feeToken);

  // ─── 3) Deploy TestEscrowFactory ────────────────────────────────────────────
  const [deployer] = await ethers.getSigners();
  const owner      = await deployer.getAddress();
  console.log("🚀 Deploying TestEscrowFactory as", owner);

  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const escrow  = await factory.deploy(
    lopAddr,
    feeToken,
    accessTok,
    owner,
    3600,    // rescueDelaySrc
    3600     // rescueDelayDst
  );
  await escrow.waitForDeployment();

  const escrowAddr = await escrow.getAddress();
  const network    = (await ethers.provider.getNetwork()).name;
  console.log(`✅ TestEscrowFactory deployed at ${escrowAddr} on ${network}`);

  // ─── 4) Persist it ──────────────────────────────────────────────────────────
  deployed.Sepolia_EscrowFactory = { address: escrowAddr, network };
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("💾 Updated", deployedPath);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
