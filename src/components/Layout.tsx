import { NavLink } from "react-router-dom";
import { Activity, Shield, BarChart3, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { useApprovals } from "../hooks/useApprovals";
import { useExecutions } from "../hooks/useExecutions";
import { useNotificationPrefs } from "../hooks/useSettings";
import { useEffect, useRef } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";

const navItems = [
  { to: "/", icon: Activity, label: "Feed" },
  { to: "/approvals", icon: Shield, label: "Approvals" },
  { to: "/stats", icon: BarChart3, label: "Stats" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

async function notify(title: string, body: string) {
  let permitted = await isPermissionGranted();
  if (!permitted) {
    const permission = await requestPermission();
    permitted = permission === "granted";
  }
  if (permitted) {
    sendNotification({ title, body });
  }
}

function TrayStatusManager() {
  const { data: pendingApprovals } = useApprovals("pending");
  const { data: executions } = useExecutions();
  const notifPrefs = useNotificationPrefs();
  const prevApprovalIds = useRef<Set<string>>(new Set());
  const prevFailedIds = useRef<Set<string>>(new Set());

  // Notification: new pending approvals
  useEffect(() => {
    const firstPage = pendingApprovals?.pages?.[0];
    if (!firstPage?.data) return;

    const items = firstPage.data;
    const currentIds = new Set(items.map((a: { id: string }) => a.id));
    const newCount = items.filter(
      (a: { id: string }) => !prevApprovalIds.current.has(a.id),
    ).length;

    if (newCount > 0 && prevApprovalIds.current.size > 0 && notifPrefs.approvals) {
      notify(
        "Approval Required",
        `${newCount} new approval${newCount > 1 ? "s" : ""} pending`,
      );
    }

    prevApprovalIds.current = currentIds;

    const count = firstPage.meta.total;
    const status = count > 0 ? `${count} pending approval${count > 1 ? "s" : ""}` : "OK";
    invoke("set_tray_status", { status }).catch(() => {});
  }, [pendingApprovals, notifPrefs.approvals]);

  // Notification: new failed executions
  useEffect(() => {
    const firstPage = executions?.pages?.[0];
    if (!firstPage?.data) return;

    const failedExecs = firstPage.data.filter(
      (e: { status: string }) => e.status === "failed",
    );
    const currentFailedIds = new Set(failedExecs.map((e: { id: string }) => e.id));
    const newFailures = failedExecs.filter(
      (e: { id: string }) => !prevFailedIds.current.has(e.id),
    );

    if (newFailures.length > 0 && prevFailedIds.current.size > 0 && notifPrefs.failures) {
      notify(
        "Execution Failed",
        `${newFailures.length} execution${newFailures.length > 1 ? "s" : ""} failed`,
      );
    }

    prevFailedIds.current = currentFailedIds;
  }, [executions, notifPrefs.failures]);

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <TrayStatusManager />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <nav className="flex shrink-0 border-t border-border bg-card">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
