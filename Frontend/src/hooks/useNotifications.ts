import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id?: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const { notifications: data } = await apiClient.getNotifications(20, 0);
            setNotifications(data || []);
            setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, user?.id]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await apiClient.markNotificationRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await apiClient.markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}
