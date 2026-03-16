import { useEffect, useState } from "react";
import { getPollingInterval, getNotificationPrefs } from "../stores/auth";

export function usePollingInterval(): number {
  const [interval, setInterval_] = useState(60000);

  useEffect(() => {
    getPollingInterval().then(setInterval_);
  }, []);

  return interval;
}

export function useNotificationPrefs(): {
  approvals: boolean;
  failures: boolean;
} {
  const [prefs, setPrefs] = useState({ approvals: true, failures: true });

  useEffect(() => {
    getNotificationPrefs().then(setPrefs);
  }, []);

  return prefs;
}
