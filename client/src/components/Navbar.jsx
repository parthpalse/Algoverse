import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-cyan-300" : "text-slate-400 hover:text-white"
  }`;

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-white/10 bg-av-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-white">
          Algo<span className="text-cyan-400">Verse</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/graph" className={linkClass}>
                Graph 3D
              </NavLink>
              <NavLink to="/truth-table" className={linkClass}>
                Truth Table
              </NavLink>
              <NavLink to="/venn" className={linkClass}>
                Venn
              </NavLink>
              <NavLink to="/hamming" className={linkClass}>
                Hamming
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-cyan-500/20 px-4 py-1.5 text-sm font-medium text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
