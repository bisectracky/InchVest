import { useState } from "react";

export default function SwapPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

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

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>💱 Token Swap Testing</h1>
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
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "background-color 0.3s ease",
        }}
      >
        {loading ? "⏳ Processing..." : "🚀 Execute Swap"}
      </button>
      <div style={{ marginTop: 20, fontWeight: "bold", color: "#333" }}>
        {result}
      </div>
    </div>
  );
}
