// scripts/deployTronHTLC.ts
import fs   from "fs";
import path from "path";
import dotenv from "dotenv";
const TronWebPkg = require("tronweb");

// load your root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  // ─── Config from .env ──────────────────────────────────────────────────────────
  const fullHost    = process.env.TRON_FULL_HOST;
  const privateKey  = process.env.TRON_PRIVATE_KEY;
  const beneficiary = process.env.HTLC_BENEFICIARY;   // who will claim on Tron
  const hashlock    = process.env.HTLC_HASHLOCK;      // keccak256(secret), hex string
  const timelock    = Number(process.env.HTLC_TIMELOCK); 
  const amount      = Number(process.env.HTLC_AMOUNT); // in SUN (1 TRX = 10^6 SUN)

  if (!fullHost || !privateKey || !beneficiary || !hashlock || !timelock || !amount) {
    console.error(
      "❌ Set TRON_FULL_HOST, TRON_PRIVATE_KEY, HTLC_BENEFICIARY, " +
      "HTLC_HASHLOCK, HTLC_TIMELOCK & HTLC_AMOUNT in .env"
    );
    process.exit(1);
  }

  // ─── Load your hand-compiled HTLC artifact ────────────────────────────────────
  const artPath = path.resolve(__dirname, "../build/contracts/HTLC.json");
  if (!fs.existsSync(artPath)) {
    console.error("❌ Cannot find", artPath);
    process.exit(1);
  }
  const art    = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const abi    = art.abi;
  let bytecode = typeof art.bytecode === "object" ? art.bytecode.object : art.bytecode;
  if (bytecode.startsWith("0x")) bytecode = bytecode.slice(2);

  // ─── Set up TronWeb ───────────────────────────────────────────────────────────
  const TronWebClass =
    (TronWebPkg.default && typeof TronWebPkg.default === "function" && TronWebPkg.default) ||
    (TronWebPkg.TronWeb  && typeof TronWebPkg.TronWeb  === "function" && TronWebPkg.TronWeb) ||
    (typeof TronWebPkg === "function" && TronWebPkg);

  const tronWeb = new TronWebClass({ fullHost, privateKey });
  const ownerHex = tronWeb.defaultAddress.hex;
  console.log("👤 Deploying HTLC from", tronWeb.address.fromHex(ownerHex));

  // ─── Deploy your HTLC ────────────────────────────────────────────────────────
  console.log("🚀 Locking", amount, "SUN in HTLC…");
  const instance = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters: [
      beneficiary,
      hashlock,
      timelock,
    ],
    feeLimit:  1_000_000_000,
    callValue: amount,
  });

  const hexAddr    = instance.address;
  const base58Addr = tronWeb.address.fromHex(hexAddr);
  console.log("✅ HTLC deployed (hex):   ", hexAddr);
  console.log("✅ HTLC deployed (base58):", base58Addr);

  // ─── Persist the HTLC address ─────────────────────────────────────────────────
  const outPath = path.resolve(__dirname, "deployedAddresses.json");
  const db: any = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : {};
  db.Tron_HTLC = { hex: hexAddr, base58: base58Addr };
  fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
  console.log("💾 Saved HTLC to", outPath);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
