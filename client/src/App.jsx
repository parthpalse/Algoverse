import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { GraphPage } from "./pages/GraphPage.jsx";
import { HammingPage } from "./pages/HammingPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { TruthTablePage } from "./pages/TruthTablePage.jsx";
import { VennPage } from "./pages/VennPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell>
            <LandingPage />
          </AppShell>
        }
      />
      <Route
        path="/login"
        element={
          <AppShell>
            <LoginPage />
          </AppShell>
        }
      />
      <Route
        path="/register"
        element={
          <AppShell>
            <RegisterPage />
          </AppShell>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/graph"
        element={
          <AppShell>
            <ProtectedRoute>
              <GraphPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/truth-table"
        element={
          <AppShell>
            <ProtectedRoute>
              <TruthTablePage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/venn"
        element={
          <AppShell>
            <ProtectedRoute>
              <VennPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/hamming"
        element={
          <AppShell>
            <ProtectedRoute>
              <HammingPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
