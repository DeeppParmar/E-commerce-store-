import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

function getNotificationIcon(type: string) {
    switch (type) {
        case "outbid":
        case "auction_lost":
            return "🔴";
        case "won":
        case "auction_won":
            return "🏆";
        case "ended":
        case "auction_ended":
            return "⏰";
        case "new_bid":
        case "first_bid":
            return "💰";
        case "ending_soon":
            return "⚡";
        case "payment_received":
            return "✅";
        case "item_shipped":
            return "📦";
        default:
            return "🔔";
    }
}

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
    };

    return (
        <div className="relative">
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-semibold flex items-center justify-center text-destructive-foreground animate-scale-in shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl animate-slide-down z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 text-muted-foreground hover:text-foreground"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
                                        notification.is_read
                                            ? "opacity-60 hover:opacity-80"
                                            : "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <span className="text-lg mt-0.5 flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm leading-snug",
                                            !notification.is_read && "font-medium"
                                        )}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {!notification.is_read && (
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                        {notification.related_id && (
                                            <Link
                                                to={`/auctions/${notification.related_id}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsOpen(false);
                                                }}
                                                className="p-1 hover:bg-accent rounded"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-border px-4 py-2">
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-primary hover:underline"
                            >
                                View all activity →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
