// hardhat/scripts/deployLimitOrderProtocolManual.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // 1) Load your hand‐dropped artifact
  const artifactPath = path.resolve(
    __dirname,
    "../../tronContracts/build/contracts/LimitOrderProtocol.json"
  );
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Cannot find LimitOrderProtocol.json at", artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi      = artifact.abi;
  let bytecode: string =
    typeof artifact.bytecode === "object"
      ? artifact.bytecode.object
      : artifact.bytecode;
  // strip leading 0x if present
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // 2) Grab your MockERC20 address
  const deployedPath = path.resolve(__dirname, "../deployedAddresses.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("❌ deployedAddresses.json not found - run deployMockERC20 first");
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  const wethAddr = deployed.MockERC20?.address;
  if (!wethAddr) {
    console.error("❌ No MockERC20 entry in deployedAddresses.json");
    process.exit(1);
  }
  console.log("🔗 Using MockERC20 as WETH for LOP:", wethAddr);

  // 3) Deploy LimitOrderProtocol
  const [deployer] = await ethers.getSigners();
  const deployerAddr = await deployer.getAddress();
  console.log(`🚀 Deploying LimitOrderProtocol from ${deployerAddr}…`);

  // manual factory bypasses Hardhat's artifact lookup
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const lop = await factory.deploy(wethAddr);
  await lop.waitForDeployment();

  const lopAddr = await lop.getAddress();
  const network = (await ethers.provider.getNetwork()).name;
  console.log(`✅ LimitOrderProtocol deployed at ${lopAddr} on ${network}`);

  // 4) Persist back to deployedAddresses.json
  deployed.LimitOrderProtocol = {
    address: lopAddr,
    network,
  };
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("💾 Updated deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
