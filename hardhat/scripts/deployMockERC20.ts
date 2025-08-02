// hardhat/scripts/deployMockERC20.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// load the root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  // 1) parameters for your mock token
  const NAME   = "MockToken";
  const SYMBOL = "MCK";
  // mint 1 000 000 tokens (18 decimals)
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);

  // 2) signer
  const [deployer] = await ethers.getSigners();
  const deployerAddr = await deployer.getAddress();
  console.log(`🚀 Deploying MockERC20 as ${deployerAddr}`);

  // 3) deploy
  const Factory = await ethers.getContractFactory("MockERC20");
  const token = await Factory.deploy(NAME, SYMBOL, INITIAL_SUPPLY);

  // wait for it to land on‐chain
  await token.waitForDeployment();

  // get its address
  const tokenAddress = await token.getAddress();
  console.log(`✅ MockERC20 deployed at: ${tokenAddress}`);

  // 4) persist to deployedAddresses.json (in hardhat/)
  const outPath = path.resolve(__dirname, "../deployedAddresses.json");
  let json: any = {};
  if (fs.existsSync(outPath)) {
    json = JSON.parse(fs.readFileSync(outPath, "utf8"));
  }
  json.MockERC20 = {
    address: tokenAddress,
    network: (await ethers.provider.getNetwork()).name,
  };
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`💾 Saved MockERC20 to ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
