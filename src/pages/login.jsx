import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../content-store";
import "../styles/login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const viewAsGuest = () => {
    sessionStorage.setItem("portfolio-admin-token", "readonly");
    navigate("/admin", { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not sign in.");
      sessionStorage.setItem("portfolio-admin-token", payload.token);
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? "The login service is unavailable right now. Please try again later."
        : requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-grid" aria-hidden="true" />
      <section className="login-panel">
        <Link className="login-brand" to="/">V. EARL</Link>
        <div className="login-intro"><p>Portfolio administration</p><h1>Sign in to edit.</h1></div>
        <form className="login-form" onSubmit={submit}>
          <label htmlFor="login-email">Email<input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label htmlFor="login-password">Password<input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
        </form>
        <button type="button" className="login-guest-btn" onClick={viewAsGuest}>View dashboard as guest</button>
        <Link className="login-return" to="/">Return to public site</Link>
      </section>
    </main>
  );
};

export default LoginPage;