// utils/TronProviderConnector.ts
// — pull in whatever ‘tronweb’ exports and hunt for the actual constructor

/* eslint-disable @typescript-eslint/no-var-requires */
const _pkg = require("tronweb");

// Sometimes the class is the default export, sometimes it’s on .TronWeb, sometimes the package
// itself is the constructor. We pick the first one that actually constructs.
const TronWebClass =
  (_pkg.default && typeof _pkg.default === "function" && _pkg.default) ||
  (_pkg.TronWeb   && typeof _pkg.TronWeb   === "function" && _pkg.TronWeb) ||
  (typeof _pkg    === "function" && _pkg);

if (!TronWebClass) {
  throw new Error("Could not locate TronWeb constructor in the 'tronweb' package");
}

export default class TronProviderConnector {
  private tronWeb: any;
  private privateKey: string;

  constructor(privateKey: string, rpcUrl: string) {
    this.privateKey = privateKey;
    this.tronWeb = new TronWebClass({
      fullHost: rpcUrl,
      privateKey: this.privateKey,
    });
  }

  /** Get the connected wallet address */
  async getAddress(): Promise<string> {
    return this.tronWeb.address.fromPrivateKey(this.privateKey);
  }

  /** Get current account balance in TRX */
  async getBalance(address?: string): Promise<string> {
    const addr   = address || (await this.getAddress());
    const balSun = await this.tronWeb.trx.getBalance(addr);
    return this.tronWeb.fromSun(balSun);
  }

  /** Send a simple TRX transfer */
  async sendTransaction(to: string, amountTrx: number): Promise<string> {
    const tx = await this.tronWeb.transactionBuilder.sendTrx(
      to,
      this.tronWeb.toSun(amountTrx),
      await this.getAddress()
    );
    const signed  = await this.tronWeb.trx.sign(tx, this.privateKey);
    const receipt = await this.tronWeb.trx.sendRawTransaction(signed);
    return receipt.txid;
  }
}
