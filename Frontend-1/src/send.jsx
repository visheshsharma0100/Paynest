import { useState, useEffect } from "react";
import './index.css';

export default function PayNestSend() {
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const sendTo = localStorage.getItem("sendTo");
  const sendToName = localStorage.getItem("sendToName") || "Unknown";

  useEffect(() => {
    if (!token) window.location.href = "/signin";
    if (!sendTo) window.location.href = "/dashboard";
  }, []);

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  }

  async function handleSend() {
    const parsed = parseInt(amount);
    if (!parsed || parsed <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://paynest-thmq.onrender.com/account/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ receiver: sendTo, amount: parsed }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        showToast(data.message || "Transfer failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="blob blob-1" />

      {/* Success overlay */}
      {success && (
        <div className="success-overlay">
          <div className="success-emoji">🎉</div>
          <div className="success-heading">Money Sent!</div>
          <div className="success-msg">
            ₹{amount} sent to {sendToName}
          </div>
          <button
            className="back-dash-btn"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav>
        <button
          className="back-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          ←
        </button>
        <div className="nav-logo">
          Pay<span className="nav-logo-gradient">Nest</span>
        </div>
      </nav>

      {/* Main */}
      <main className="page-main">
        <div className="container">
          {/* Recipient card */}
          <div className="recipient">
            <div className="recipient-avatar">
              {sendToName[0].toUpperCase()}
            </div>
            <div className="recipient-name">{sendToName}</div>
            <div className="recipient-label">Send money to</div>
          </div>

          {/* Amount card */}
          <div className="amount-card">
            <div className="amount-label">Enter Amount</div>

            <div className="amount-input-wrap">
              <span className="rupee-sign">₹</span>
              <input
                className="amount-input"
                type="number"
                placeholder="0"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="quick-amounts">
              {[100, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  className="quick-btn"
                  onClick={() => setAmount(String(val))}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Money"}
            </button>

            {toast.msg && (
              <div className={`toast ${toast.type}`}>{toast.msg}</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
