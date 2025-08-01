require('dotenv').config();

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      /**
       * Create a .env file (it must be gitignored) containing something like
       *
       *   export PRIVATE_KEY_MAINNET=4E7FEC...656243
       *
       * Then, run the migration with:
       *
       *   source .env && tronbox migrate --network mainnet
       */
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      // Obtain test coin at https://shasta.tronex.io/
      privateKey: "b770847f6934a854c6b67f952ef6837ffb8f8f6ce952bcc3acac57f625b6e618",
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2',
    },
    nile: {
      // Obtain test coin at https://nileex.io/join/getJoinPage
      privateKey: "b770847f6934a854c6b67f952ef6837ffb8f8f6ce952bcc3acac57f625b6e618",
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://nile.trongrid.io',
      network_id: '3'
    },
    development: {
      // For tronbox/tre docker image
      // See https://hub.docker.com/r/tronbox/tre
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      userFeePercentage: 0,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '9'
    }
  },
compilers: {
solc: {
  version: '0.8.20',
  optimizer: {
    enabled: true,
    runs: 200
       },
     }
  }
};
