import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { initClient } from "./lib/api";
import Approvals from "./pages/Approvals";
import ExecutionDetail from "./pages/ExecutionDetail";
import Feed from "./pages/Feed";
import Settings from "./pages/Settings";
import Setup from "./pages/Setup";
import Stats from "./pages/Stats";
import TrayPanel from "./pages/TrayPanel";
import { getApiKey, getApiUrl } from "./stores/auth";

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
