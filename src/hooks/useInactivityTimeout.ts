import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_KEY = "sales_collection_hub_last_activity";

export const useInactivityTimeout = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        console.warn(
          "User inactive for 15 minutes. Automatically logging out.",
        );
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const recordActivity = () => {
      localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    };

    // Throttle listener to avoid resetting on every pixel movement
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 2000) {
        lastActivity = now;
        resetTimer();
        recordActivity();
      }
    };

    const handleStorageActivity = (event: StorageEvent) => {
      if (event.key !== ACTIVITY_KEY || !event.newValue) return;
      const activityAt = Number(event.newValue);
      if (
        Number.isFinite(activityAt) &&
        Date.now() - activityAt < INACTIVITY_TIMEOUT_MS
      ) {
        resetTimer();
      }
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    window.addEventListener("storage", handleStorageActivity);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener("storage", handleStorageActivity);
    };
  }, [currentUser, logout]);
};
