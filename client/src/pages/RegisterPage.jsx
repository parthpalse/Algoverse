import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, displayName);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-av-card/80 p-8 shadow-xl">
      <h1 className="font-display text-2xl font-bold text-white">Create your AlgoVerse account</h1>
      <p className="mt-2 text-sm text-slate-400">Password must be at least 8 characters.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Display name (optional)</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-violet-500/90 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
        >
          Sign up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
