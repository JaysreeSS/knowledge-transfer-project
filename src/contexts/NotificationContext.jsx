import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // ─── Fetch all unread notifications for this user ───────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data);
            }
        } catch (err) {
            console.error('[NotificationContext] fetchNotifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // ─── Load on mount + realtime subscription ───────────────────────────────────
    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        // Realtime subscription so every tab/device gets live updates
        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        // If updated to is_read=true, remove from list
                        if (payload.new.is_read) {
                            setNotifications(prev => prev.filter(n => n.id !== payload.new.id));
                        } else {
                            setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, fetchNotifications]);

    // ─── Push a new notification ──────────────────────────────────────────────────
    /**
     * @param {{ user_id: string, module: 'admin'|'manager'|'icr', type: string, title: string, body?: string, project_id?: string, project_name?: string }} notification
     */
    const pushNotification = useCallback(async (notification) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: notification.user_id,
                    module: notification.module || 'general',
                    type: notification.type || 'general',
                    title: notification.title,
                    body: notification.body || null,
                    project_id: notification.project_id || null,
                    project_name: notification.project_name || null,
                    is_read: false,
                }]);
            if (error) throw error;
        } catch (err) {
            console.error('[NotificationContext] pushNotification error:', err);
        }
    }, []);

    // ─── Mark a single notification as read (removes from list) ──────────────────
    const markAsRead = useCallback(async (notificationId) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .eq('user_id', user.id);
            if (error) throw error;
        } catch (err) {
            console.error('[NotificationContext] markAsRead error:', err);
            // Revert on failure
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // ─── Mark ALL notifications as read for this user (optional module filter) ───
    const markAllAsRead = useCallback(async (module = null) => {
        // Optimistic update
        if (module) {
            setNotifications(prev => prev.filter(n => n.module !== module));
        } else {
            setNotifications([]);
        }
        try {
            let query = supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (module) query = query.eq('module', module);

            const { error } = await query;
            if (error) throw error;
        } catch (err) {
            console.error('[NotificationContext] markAllAsRead error:', err);
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // ─── Delete a single notification permanently ─────────────────────────────────
    const deleteNotification = useCallback(async (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', user.id);
            if (error) throw error;
        } catch (err) {
            console.error('[NotificationContext] deleteNotification error:', err);
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // ─── Delete ALL notifications for this user (optional module filter) ─────────
    const clearNotifications = useCallback(async (module = null) => {
        if (module) {
            setNotifications(prev => prev.filter(n => n.module !== module));
        } else {
            setNotifications([]);
        }
        try {
            let query = supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

            if (module) query = query.eq('module', module);

            const { error } = await query;
            if (error) throw error;
        } catch (err) {
            console.error('[NotificationContext] clearNotifications error:', err);
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // ─── Derived helpers ──────────────────────────────────────────────────────────
    const getModuleNotifications = (module) =>
        notifications.filter(n => n.module === module);

    const hasUnread = (module = null) =>
        module
            ? notifications.some(n => n.module === module && !n.is_read)
            : notifications.length > 0;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                loading,
                pushNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearNotifications,
                getModuleNotifications,
                hasUnread,
                refetch: fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
};
