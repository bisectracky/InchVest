import { useState } from "react";

export default function SwapPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");

  const executeSwap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/swap", { method: "POST" });
      const data = await response.json();
      setResult(data.txHash || "Swap executed successfully");
    } catch (err) {
      setResult("Error executing swap");
    } finally {
      setLoading(false);
    }
  };

  const handleFusionSwap = async () => {
    try {
      const response = await fetch("/api/fusionSwap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Fusion+ Order Created:", data);
    } catch (err) {
      console.error("Fusion+ swap error:", err);
    }
  };

  // ✅ NEW: Check Order Status
  const checkOrderStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fusionStatus", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setStatus(JSON.stringify(data, null, 2)); // formatted display
    } catch (err) {
      console.error("Error fetching order status:", err);
      setStatus("❌ Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Deploy Tron Escrow Contract
  const deployTronContract = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/deployTron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log(data);
      setResult(
        `✅ Contract deployed at: ${data.contractAddress || "unknown"}`
      );
    } catch (err) {
      console.error("Deployment error:", err);
      setResult("❌ Failed to deploy Tron contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>💱 Token Swap Testing</h1>

      {/* Execute Swap Button */}
      <button
        onClick={executeSwap}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: loading ? "#aaa" : "#4CAF50",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginRight: "10px",
        }}
      >
        {loading ? "⏳ Processing..." : "🚀 Execute Swap"}
      </button>

      {/* Fusion+ Swap Button */}
      <button
        onClick={handleFusionSwap}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: loading ? "#aaa" : "#af984cff",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginRight: "10px",
        }}
      >
        {loading ? "⏳ Processing..." : "🚀 Execute Fusion+ Swap"}
      </button>

      {/* ✅ Check Order Status Button */}
      <button
        onClick={checkOrderStatus}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: loading ? "#aaa" : "#007BFF",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginRight: "10px",
        }}
      >
        {loading ? "⏳ Checking..." : "🔍 Check Order Status"}
      </button>
      {/* Fusion+ ETH→TRON Swap Button */}
<button
  onClick={async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tronFusionSwap", { method: "POST" });
      const { orderHash } = await res.json();
      setResult(`🚀 Fusion+ swap started: ${orderHash}`);
    } catch (e) {
      setResult("❌ Tron Fusion+ swap failed");
    } finally {
      setLoading(false);
    }
  }}
  disabled={loading}
  style={{
    padding: "12px 20px",
    backgroundColor: loading ? "#aaa" : "#E53E3E",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    marginRight: "10px",
  }}
>
  {loading ? "⏳ Processing..." : "🌉 ETH → TRON Fusion+ Swap"}
</button>
      {/* Results */}
      <div style={{ marginTop: 20, fontWeight: "bold", color: "#333" }}>
        {result}
      </div>

      {status && (
        <pre
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f4f4f4",
            borderRadius: "8px",
          }}
        >
          {status}
        </pre>
      )}
    </div>
  );
}
