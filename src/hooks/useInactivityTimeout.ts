import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

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

    // Throttle listener to avoid resetting on every pixel movement
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 2000) {
        lastActivity = now;
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

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, logout]);
};
