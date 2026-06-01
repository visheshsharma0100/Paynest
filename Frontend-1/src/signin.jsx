import { useState, useEffect } from "react";
import './index.css';

export default function PayNestSignIn() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  // Enter key support
  useEffect(() => {
    const handler = (e) => { if (e.key === "Enter") handleSignin(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function showToast(msg, type) {
    setToast({ msg, type });
  }

  async function handleSignin() {
    const { username, password } = form;

    if (!username.trim() || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    setToast({ msg: "", type: "" });

    try {
      const res = await fetch("http://localhost:3000/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        showToast("Welcome back! Redirecting...", "success");
        setTimeout(() => (window.location.href = "/dashboard"), 1000);
      } else {
        showToast(data.message || "Invalid credentials", "error");
      }
    } catch {
      showToast("Cannot connect to server", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <div className="logo">
          Pay<span className="logo-gradient">Nest</span>
        </div>

        <div className="card">
          <div className="card-title">Welcome back</div>
          <div className="card-sub">Sign in to your account</div>

          <div className="field">
            <label htmlFor="username">Email</label>
            <input
              id="username" name="username" type="email"
              className="field-input" placeholder="visheshsharma0100@gmail.com"
              value={form.username} onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className="field-input" placeholder="••••••••"
              value={form.password} onChange={handleChange}
            />
          </div>

          <button className="btn" onClick={handleSignin} disabled={loading}>
            {loading ? <div className="spinner" /> : "Sign In"}
          </button>

          {toast.msg && (
            <div className={`toast ${toast.type}`}>{toast.msg}</div>
          )}
        </div>

        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </>
  );
}