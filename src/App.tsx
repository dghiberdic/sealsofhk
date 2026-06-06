import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useStore } from "./lib/store";
import { Welcome } from "./pages/Welcome";
import { ProfileSetup } from "./pages/Profile";
import { Connect } from "./pages/Connect";
import { Today } from "./pages/Today";
import { Health } from "./pages/Health";
import { Trends } from "./pages/Trends";
import { InsightDetail } from "./pages/InsightDetail";
import { AskDoctor } from "./pages/AskDoctor";
import { Report } from "./pages/Report";
import { Learn } from "./pages/Learn";
import { Settings } from "./pages/Settings";

function AppShell() {
  const { onboarded } = useStore();
  const loc = useLocation();
  if (!onboarded && !loc.pathname.startsWith("/r/")) {
    return <Navigate to="/welcome" replace />;
  }
  return (
    <Layout>
      <Routes>
        <Route path="/today" element={<Today />} />
        <Route path="/health" element={<Health />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/insight/:id" element={<InsightDetail />} />
        <Route path="/ask" element={<AskDoctor />} />
        <Route path="/report" element={<Report />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Onboarding (no app chrome) */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/profile" element={<ProfileSetup />} />
      <Route path="/connect" element={<Connect />} />
      {/* Public, read-only shared report */}
      <Route path="/r/:token" element={<Report shared />} />
      {/* The app */}
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
}
