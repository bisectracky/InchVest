# Inchvest Cross-chain-Swap

We have tried to extend the protocol to ETH Sepolia - Tron Nile but got into an issue that once we are setting up the sdk.CrossChainOrder.new, the takerAsset, which is the tron ERC20 address, is going to passed as undefined to its constructor. This is where we stucked and was unable to resolve that issue.

If you would like to try our code in the demoSwap.tsx you will need the following .env

    SEPOLIA_RPC_URL= your sepolia RPC_URL
    PRIVATE_KEY= your private key
    SEPOLIA_ESCROW_FACTORY= this is already deployed to deployedAddressed.json => 0x1Af11de45a2bD3Bc5Cc06504C1db3e6406970a6c
    SEPOLIA_TOKEN= also deployed to deployedAddresses.json inside hardhat folder => 0xB7eB8AdD336A42FBf5022a0767a579EA54a39177
    TRON_FULL_HOST=https://nile.trongrid.io
    TRON_PRIVATE_KEY= your tron wallet private key
    TRON_RESOLVER= deployed in deployedAddresses.json inside tronContracts => 41f6dadfa6dd3e23a029e1bc8244fb25429c9d7ee3 (convert to evmHex) 
    TRON_TOKEN= Also deployed to deployedAddresses.json isnide tronContracts => 41e926c0c8c7d25b69fb8ffc0aeaab27e13aaf641c (convert to evmHex)

    If you have set this up, go into hardhat folder and run npm i then run npx hardhat run scripts/demoSwap.tsx --network Sepolia

    This code should is only up to the orderCreation, but you will see the error that the takerAsset is going to be undefined.

    You can deploy your own addresses as well, you can find the deployScripts in both the tronContracts and the hardhatFolder for the sepolia contracts. You will need to extend your .env file for that, but the new contracts will be saved to the deployedAddresses.json file and you will be able to use them later.
