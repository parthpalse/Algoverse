import { Navbar } from "./Navbar.jsx";

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        AlgoVerse — MERN stack demo. Built with React, Three.js, Express, MongoDB.
      </footer>
    </div>
  );
}
