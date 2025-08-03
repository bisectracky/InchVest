import {z} from 'zod'
import Sdk from '@1inch/cross-chain-sdk'
import * as process from 'node:process'

const bool = z
    .string()
    .transform((v) => v.toLowerCase() === 'true')
    .pipe(z.boolean())

const ConfigSchema = z.object({
    SRC_CHAIN_RPC: z.string().url(),
    DST_CHAIN_RPC: z.string().url(),
    SRC_CHAIN_CREATE_FORK: bool.default('false'),
    DST_CHAIN_CREATE_FORK: bool.default('false')
})

const fromEnv = ConfigSchema.parse(process.env)

export const config = {
    chain: {
        source: {
            chainId: 11155111,
            url: "https://eth-sepolia.g.alchemy.com/v2/IrA8aL9WyIexhYprYOEgMfaNREpLpuE0",
            createFork: fromEnv.SRC_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0xDe179699174eD396ea4F47FC9da0C28F320B87dE',
            wrappedNative: '0xB7eB8AdD336A42FBf5022a0767a579EA54a39177',
            ownerPrivateKey: '0x972fde6d745591315b78cc6c2fc06ebdf0d20ce5821691785444ab6ee16d93b0',
            tokens: {
                MCK: {
                    address: '0xB7eB8AdD336A42FBf5022a0767a579EA54a39177',
                    donor: '0x6fA26735bDCD8D598f6F1384Fc59F0180e903101'
                }
            }
        },
        destination: {
            chainId: 3448148188,
            url: "https://nile.trongrid.io",
            createFork: fromEnv.DST_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0x9dfcd0109873d74272621ce2ac962040456f325a',
            wrappedNative: '0x75155f4d9e0bcd3c974670c901b48ebc04af1721',
            ownerPrivateKey: 'b770847f6934a854c6b67f952ef6837ffb8f8f6ce952bcc3acac57f625b6e618',
            tokens: {
                WETH: {
                    address: '0x75155f4d9e0bcd3c974670c901b48ebc04af1721',
                    donor: '0x41b9303798ee96c73ccd1fa484fda2f478fb4d6c36'
                }
            }
        }
    }
} as const

export type ChainConfig = (typeof config.chain)['source' | 'destination']
