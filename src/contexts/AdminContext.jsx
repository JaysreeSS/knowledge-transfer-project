import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AdminContext = createContext(undefined);

export const AdminProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load and Realtime Subscriptions
    useEffect(() => {
        fetchData();

        // Realtime subscription for users table
        const usersSubscription = supabase
            .channel('public:users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                console.log("[AdminContext] User change detected:", payload);
                if (payload.eventType === 'INSERT') {
                    const newUser = { ...payload.new, isAdmin: payload.new.role === 'System Admin' };
                    setUsers(prev => {
                        // Avoid duplicates if we already added it optimistically
                        if (prev.find(u => u.id === newUser.id)) return prev;
                        return [...prev, newUser];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedUser = { ...payload.new, isAdmin: payload.new.role === 'System Admin' };
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                } else if (payload.eventType === 'DELETE') {
                    setUsers(prev => prev.filter(u => u.id !== payload.old.id));
                }
            })
            .subscribe();

        // Realtime subscription for templates table
        const templatesSubscription = supabase
            .channel('public:templates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, (payload) => {
                console.log("[AdminContext] Template change detected:", payload);
                if (payload.eventType === 'INSERT') {
                    const newTemplate = { ...payload.new, input_type: ['text', 'file'] };
                    setTemplates(prev => {
                        if (prev.find(t => t.id === newTemplate.id)) return prev;
                        return [...prev, newTemplate].sort((a, b) => (a.order || 0) - (b.order || 0));
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedTemplate = { ...payload.new, input_type: payload.new.input_type || ['text', 'file'] };
                    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t).sort((a, b) => (a.order || 0) - (b.order || 0)));
                } else if (payload.eventType === 'DELETE') {
                    setTemplates(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(usersSubscription);
            supabase.removeChannel(templatesSubscription);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users
            const { data: usersData, error: usersError } = await supabase.from('users').select('*');
            if (!usersError && usersData) {
                setUsers(usersData.map(u => ({
                    ...u,
                    isAdmin: u.role === 'System Admin'
                })));
            }

            // Fetch Templates
            const { data: templatesData, error: templatesError } = await supabase
                .from('templates')
                .select('*')
                .order('order', { ascending: true });

            if (!templatesError && templatesData) {
                const normalizedTemplates = templatesData.map(t => ({
                    ...t,
                    input_type: t.input_type || ['text', 'file']
                }));
                setTemplates(normalizedTemplates);
            }
        } catch (error) {
            console.error("Error in fetchData:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Users Operations ---
    // --- Users Operations ---
    const addUser = async (user) => {
        try {
            const { data, error } = await supabase.functions.invoke('manage-user', {
                body: {
                    action: 'create',
                    email: user.email || null,    // Reminder email (optional)
                    username: user.username,      // Login identifier
                    password: user.password,
                    name: user.name,
                    role: user.role,
                }
            });

            // When Edge Function returns non-2xx, the real error JSON is in error.context.body
            if (error) {
                let realMessage = error.message;
                try {
                    const body = await error.context?.json?.();
                    if (body?.error) realMessage = body.error;
                } catch (_) { }
                console.error("Edge Function Error (addUser):", realMessage);
                return { success: false, error: realMessage };
            }
            if (data?.error) {
                console.error("manage-user Error:", data.error);
                return { success: false, error: data.error };
            }
            if (data?.user) {
                setUsers(prev => [...prev, { ...data.user, isAdmin: data.user.role === 'System Admin' }]);
                return { success: true };
            }
            return { success: false, error: 'Unexpected response from server.' };
        } catch (error) {
            console.error("Error adding user:", error);
            return { success: false, error: error.message };
        }
    };

    const updateUser = async (id, updates) => {
        try {
            const { isAdmin, ...dbUpdates } = updates;
            // Optimistic update
            const originalUsers = [...users];
            setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));

            const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);

            if (error) {
                // Revert on error
                setUsers(originalUsers);
                console.error("Supabase Error updating user:", error);
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating user:", error);
            return { success: false, error: error.message };
        }
    };

    const deleteUser = async (id) => {
        try {
            // Optimistic update
            const originalUsers = [...users];
            setUsers(prev => prev.filter(u => u.id !== id));

            // Calls Edge Function which uses service_role to:
            // 1. Delete from public users table
            // 2. Delete from auth.users (removes login credentials)
            const { data, error } = await supabase.functions.invoke('manage-user', {
                body: { action: 'delete', userId: id }
            });

            if (error || data?.error) {
                // Revert on error
                setUsers(originalUsers);
                const msg = data?.error || error?.message;
                console.error("manage-user delete Error:", msg);
                return { success: false, error: msg };
            }
            return { success: true };
        } catch (error) {
            console.error("Error deleting user:", error);
            return { success: false, error: error.message };
        }
    };

    // --- Templates Operations ---
    const addTemplate = async (templateData) => {
        const newTemplate = typeof templateData === 'string'
            ? { title: templateData }
            : templateData;

        try {
            const maxOrder = templates.reduce((max, t) => Math.max(max, t.order || 0), 0);
            const { data, error } = await supabase
                .from('templates')
                .insert([{
                    title: newTemplate.title,
                    description: newTemplate.description || '',
                    order: maxOrder + 1
                }])
                .select();

            if (error) throw error;
            if (data) {
                setTemplates(prev => [...prev, { ...data[0], input_type: ['text', 'file'] }]);
            }
        } catch (error) {
            console.error("Error adding template:", error);
        }
    };

    const updateTemplate = async (id, updates) => {
        try {
            const { input_type, ...dbUpdates } = updates;
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            const { error } = await supabase.from('templates').update(dbUpdates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating template:", error);
        }
    };

    const deleteTemplate = async (id) => {
        try {
            setTemplates(prev => prev.filter(t => t.id !== id));
            const { error } = await supabase.from('templates').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting template:", error);
        }
    };

    return (
        <AdminContext.Provider
            value={{
                users, addUser, updateUser, deleteUser,
                templates, addTemplate, updateTemplate, deleteTemplate,
                loading
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
};


