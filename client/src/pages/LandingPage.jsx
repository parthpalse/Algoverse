import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LandingScene } from "../components/LandingScene.jsx";

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="relative">
        <LandingScene />
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Explore algorithms in{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              three dimensions
            </span>
          </h1>
          <p className="pointer-events-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            AlgoVerse combines graph traversals, logic tools, set visualizations, and error-correcting codes —
            with your work saved to a personal dashboard.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-cyan-500/90 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-xl bg-cyan-500/90 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/20 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "3D graph traversals",
            body: "Draw nodes and edges, then animate BFS, DFS, or Warshall’s closure — computed by the API.",
          },
          {
            title: "Logic & sets",
            body: "Truth tables with CNF/DNF, and Venn diagrams for unions, intersections, and differences.",
          },
          {
            title: "Hamming (7,4)",
            body: "Encode data, flip a bit, and watch the syndrome pinpoint and correct a single error.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-av-card/60 p-6 shadow-xl shadow-black/20"
          >
            <h2 className="font-display text-lg font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
