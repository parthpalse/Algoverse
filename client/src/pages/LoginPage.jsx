import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-av-card/80 p-8 shadow-xl">
      <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to sync your algorithm history.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none ring-cyan-500/0 focus:ring-2"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none ring-cyan-500/0 focus:ring-2"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-cyan-500/90 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Log in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{" "}
        <Link to="/register" className="text-cyan-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
