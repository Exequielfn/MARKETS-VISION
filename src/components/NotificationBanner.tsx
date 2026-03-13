import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Example: Show welcome notification
    const welcomeNotification: Notification = {
      id: "1",
      message:
        "Welcome to MarketWizard! Connect your wallet to start analysing markets with AI.",
      type: "info",
    };
    setNotifications([welcomeNotification]);

    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      setNotifications([]);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm border animate-slideIn ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : notification.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
