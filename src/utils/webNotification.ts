// Web & Push Notification helper for mobile and desktop

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionStatus():
  NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    badge?: string;
    data?: any;
    vibrate?: number[];
  },
) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/pwa-192x192.png",
      badge: options?.badge || "/pwa-192x192.png",
      tag: options?.tag || "sales-collection-alert",
      vibrate: options?.vibrate || [100, 50, 100],
      data: options?.data,
    } as NotificationOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Also attempt sound/haptic if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    return notification;
  } catch (err) {
    console.warn("Failed to display browser notification:", err);
    return null;
  }
}
