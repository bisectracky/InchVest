import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SEPOLIA_RPC_URL    = process.env.SEPOLIA_RPC_URL    || "";
const MAINNET_RPC_URL    = process.env.MAINNET_RPC_URL    || "";
const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY
  ? [process.env.PRIVATE_KEY]
  : [];

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY,
      chainId: 11155111,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY,
      chainId: 1,
    },
  },
  // optional: add etherscan for contract verification
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
