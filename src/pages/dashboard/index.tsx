import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

export default function Dashboard() {
  const { user, authenticated, ready, login, logout } = usePrivy();
  const { client } = useSmartWallets();
  const [signature, setSignature] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated]);

  const handleSignMessage = async () => {
    if (!client) {
      console.warn("Smart wallet client not ready");
      return;
    }

    try {
      const message = "Hello from Privy + Pimlico!";
      const sig = await client.signMessage({
        message,
      });
      setSignature(sig);
      console.log("Signature:", sig);
    } catch (err) {
      console.error("Signing failed:", err);
    }
  };

  const handleSendTransaction = async () => {
  if (!client) {
    console.warn("Smart wallet client not ready");
    return;
  }

  try {
const userOpHash = await client.sendTransaction({
  to: "0x000000000000000000000000000000000000dead",
  value: BigInt(0),
});

console.log("UserOp sent:", userOpHash);
alert(`Transaction sent!\nUserOp Hash:\n${userOpHash}`);
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed. See console.");
  }
};

  if (!ready) return <p className="p-8 text-slate-700">Loading...</p>;
  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 text-slate-800">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>

        <div className="text-left space-y-2">
          <p>
            <span className="font-semibold">Wallet:</span>{" "}
            {user?.wallet?.address}
          </p>
          {user?.email && (
            <p>
              <span className="font-semibold">Email:</span> {user.email.address}
            </p>
          )}
        </div>

        <button
          onClick={handleSignMessage}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Sign Message
        </button>
        <button
  onClick={handleSendTransaction}
  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
>
  Send 0 ETH Tx
</button>

        {signature && (
          <div className="mt-4 text-left text-sm text-slate-600 break-all">
            <p className="font-semibold">Signature:</p>
            <code>{signature}</code>
          </div>
        )}

        <button
          onClick={logout}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
