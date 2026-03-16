import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiKey, getApiUrl } from "./stores/auth";
import { initClient } from "./lib/api";
import { Layout } from "./components/Layout";
import Feed from "./pages/Feed";
import ExecutionDetail from "./pages/ExecutionDetail";
import Approvals from "./pages/Approvals";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import TrayPanel from "./pages/TrayPanel";
import Setup from "./pages/Setup";

export default function App() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      const apiKey = await getApiKey();
      const apiUrl = await getApiUrl();

      if (apiKey) {
        initClient(apiKey, apiUrl);
        setReady(true);
      } else {
        setReady(false);
      }
    }
    init();
  }, []);

  // Loading
  if (ready === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // No API key → setup
  if (!ready) {
    return (
      <Setup
        onConnected={() => {
          setReady(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tray" element={<TrayPanel />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/executions/:id" element={<ExecutionDetail />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
