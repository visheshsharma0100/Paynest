import { useState, useEffect } from "react";
import './index.css';

export default function PayNestSignUp() {
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  // Enter key support
  useEffect(() => {
    const handler = (e) => { if (e.key === "Enter") handleSignup(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function showToast(msg, type) {
    setToast({ msg, type });
  }

  async function handleSignup() {
    const { firstName, lastName, username, password } = form;

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    setToast({ msg: "", type: "" });

    try {
      const res = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, firstName, lastName }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Account created! Redirecting...", "success");
        setTimeout(() => (window.location.href = "/signin"), 1500);
      } else {
        showToast(data.message || "Something went wrong", "error");
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
      <div className="blob blob-3" />

      <div className="container">
        <div className="logo">
          Pay<span className="logo-gradient">Nest</span>
        </div>

        <div className="card">
          <div className="card-title">Create account</div>
          <div className="card-sub">Join thousands sending money instantly</div>

          {/* First & Last name row */}
          <div className="row">
            <div className="field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName" name="firstName" type="text"
                className="field-input" placeholder="Vishesh"
                value={form.firstName} onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName" name="lastName" type="text"
                className="field-input" placeholder="Sharma"
                value={form.lastName} onChange={handleChange}
              />
            </div>
          </div>

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
              className="field-input" placeholder="Min 3 characters"
              value={form.password} onChange={handleChange}
            />
          </div>

          <button className="btn" onClick={handleSignup} disabled={loading}>
            {loading ? <div className="spinner" /> : "Create Account"}
          </button>

          {toast.msg && (
            <div className={`toast ${toast.type}`}>{toast.msg}</div>
          )}
        </div>

        <div className="signin-link">
          Already have an account? <a href="/signin">Sign in</a>
        </div>
      </div>
    </>
  );
}