import { useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";

export default function Dashboard() {
  const { user, authenticated, ready, login, logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      // Trigger login directly
      login();
    }
  }, [ready, authenticated]);

  if (!ready) return <p className="p-8 text-slate-700">Loading...</p>;

  if (!authenticated) return null; // Hide content during login

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
          onClick={logout}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
