import { useState, useEffect, useRef } from "react";
import './index.css';
export default function PayNestDashboard() {
  const [balance, setBalance] = useState(null);
  const [balanceSub, setBalanceSub] = useState("Loading your balance...");
  const [users, setUsers] = useState(null); // null = loading
  const [search, setSearch] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const searchTimer = useRef(null);

  const token = localStorage.getItem("token");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) window.location.href = "/signin";
  }, [token]);

  // Load balance on mount
  useEffect(() => {
    loadBalance();
    loadUsers("");
  }, []);

  async function loadBalance() {
    try {
      const res = await fetch("https://paynest-thmq.onrender.com/account/balance", {
        headers: { token },
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance.toLocaleString("en-IN"));
        setBalanceSub("Available to transfer");
      } else {
        setBalanceSub("Could not load balance");
      }
    } catch {
      setBalanceSub("Server not reachable");
    }
  }

  async function loadUsers(filter) {
    try {
      const res = await fetch(
        `https://paynest-thmq.onrender.com/user/bulk?filter=${filter}`,
        { headers: { token } }
      );
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  }

  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadUsers(val), 300);
  }

  async function loadTransactions() {
    try {
      console.log("Loading transactions with token:", token);
      const res = await fetch("https://paynest-thmq.onrender.com/account/transactions", {
        headers: { token },
      });
      const data = await res.json();
      console.log("Transactions API response:", data);
      console.log("Response status:", res.status, "OK:", res.ok);
      setTransactions(data.transactions || []);
      setShowTransactions(true);
    } catch (err) {
      console.error("Error loading transactions:", err);
      setTransactions([]);
      setShowTransactions(true);
    }
  }

  function goToSend(userId, name) {
    localStorage.setItem("sendTo", userId);
    localStorage.setItem("sendToName", name);
    window.location.href = "/send";
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/signin";
  }

  return (
    <>
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Navbar */}
      <nav>
        <div className="nav-logo">
          Pay<span className="nav-logo-gradient">Nest</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </nav>

      {/* Main content */}
      <main>
        {/* Transactions Modal */}
        {showTransactions && (
          <div className="modal-overlay" onClick={() => setShowTransactions(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Recent Transactions</h2>
                <button className="modal-close" onClick={() => setShowTransactions(false)}>✕</button>
              </div>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <div className="empty-trans">No transactions yet</div>
                ) : (
                  transactions.map((t, idx) => (
                    <div key={idx} className={`transaction-item ${t.type}`}>
                      <div className="trans-left">
                        <div className={`trans-icon ${t.type}`}>
                          {t.type === 'sent' ? '→' : '←'}
                        </div>
                        <div className="trans-info">
                          <div className="trans-name">
                            {t.type === 'sent' ? `To: ${t.receiverName}` : `From: ${t.senderName}`}
                          </div>
                          <div className="trans-time">
                            {new Date(t.timestamp).toLocaleDateString('en-IN')} {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className={`trans-amount ${t.type}`}>
                        {t.type === 'sent' ? '-' : '+'}₹{t.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Balance card */}
        <div className="balance-card">
          <div className="balance-label">Your Balance</div>
          <div className="balance-amount">
            <span className="currency">₹</span>
            {balance ?? "—"}
          </div>
          <div className="balance-sub">{balanceSub}</div>
          <button className="trans-btn" onClick={loadTransactions}>
            📋 Check your last transaction
          </button>
        </div>

        {/* Section heading */}
        <div className="section-title">Send Money</div>

        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Users list */}
        <div className="users-list">
          {users === null ? (
            // Skeleton loaders
            [1, 2, 3].map((n) => <div key={n} className="skeleton" />)
          ) : users.length === 0 ? (
            <div className="empty">No users found</div>
          ) : (
            users.map((u) => (
              <div key={u._id} className="user-card">
                <div className="user-left">
                  <div className="avatar">
                    {u.firstName[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="user-email">{u.username || ""}</div>
                  </div>
                </div>
                <button
                  className="send-btn"
                  onClick={() =>
                    goToSend(u._id, `${u.firstName} ${u.lastName}`)
                  }
                >
                  Send ₹
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
