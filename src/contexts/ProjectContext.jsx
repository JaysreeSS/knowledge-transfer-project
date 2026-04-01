import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext(undefined);

export const ProjectProvider = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const fetchProjects = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        console.log("[ProjectContext] Fetching projects from Supabase...");
        const { data, error } = await supabase
            .from("projects")
            .select(`
                *,
                project_members (
                    id,
                    user_id,
                    kt_role,
                    users (name, role, avatar_url)
                ),
                project_sections (
                    id,
                    title,
                    description,
                    content,
                    status,
                    contributor_id,
                    order,
                    clarity_score,
                    clarity_suggestions,
                    ai_quiz,
                    section_attachments (
                        id,
                        file_name,
                        file_size,
                        url,
                        uploaded_by_name,
                        uploaded_at
                    ),
                    section_comments (
                        id,
                        user_id,
                        user_name,
                        text,
                        timestamp
                    ),
                    section_links (
                        id,
                        title,
                        url,
                        created_by_name,
                        created_at
                    )
                ),
                lifecycle_mode,
                transition_type,
                transition_count,
                receiver_section_progress (
                    id,
                    section_id,
                    receiver_id,
                    status,
                    updated_at
                )
            `)
            .neq('status', 'Deleted')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            // Fallback to sessionStorage ONLY if data is empty or we had an actual error
            const stored = sessionStorage.getItem("kt_projects");
            if (stored && projects.length === 0) {
                console.log("[ProjectContext] Loading from sessionStorage fallback due to error.");
                setProjects(JSON.parse(stored));
            }
        } else {
            console.log(`[ProjectContext] Successfully fetched ${data?.length || 0} projects.`);
            const formattedProjects = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                completion: p.completion || 0,
                deadline: p.deadline,
                managerId: p.manager_id,
                managerName: p.manager_name,
                createdAt: p.created_at,
                lifecycleMode: (p.lifecycle_mode || (p.status?.toLowerCase() === 'signed off' ? 'ACTIVE' : 'TRANSITION')).toUpperCase(),
                transitionType: p.transition_type || 'INDIVIDUAL',
                transitionCount: p.transition_count || 0,
                members: (p.project_members || []).map(m => ({
                    id: m.id,
                    userId: m.user_id,
                    name: m.users?.name || 'Unknown',
                    ktRole: m.kt_role,
                    functionalRole: m.users?.role || 'Member'
                })),
                sections: (p.project_sections || [])
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(s => ({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        content: s.content,
                        status: s.status,
                        contributorId: s.contributor_id,
                        order: s.order,
                        attachments: (s.section_attachments || []).map(a => ({
                            id: a.id,
                            fileName: a.file_name,
                            fileSize: a.file_size,
                            url: a.url,
                            uploadedByName: a.uploaded_by_name,
                            uploadedAt: a.uploaded_at
                        })),
                        comments: (s.section_comments || []).map(c => ({
                            id: c.id,
                            userId: c.user_id,
                            userName: c.user_name,
                            text: c.text,
                            timestamp: c.timestamp
                        })),
                        links: (s.section_links || []).map(l => ({
                            id: l.id,
                            title: l.title,
                            url: l.url,
                            createdByName: l.created_by_name,
                            createdAt: l.created_at
                        })),
                        clarityScore: s.clarity_score || 0,
                        claritySuggestions: s.clarity_suggestions || [],
                        aiQuiz: s.ai_quiz || null
                    })),
                techStack: p.tech_stack || [],
                receiverProgress: (p.receiver_section_progress || []).map(rp => ({
                    id: rp.id,
                    sectionId: rp.section_id,
                    receiverId: rp.receiver_id,
                    status: rp.status,
                    updatedAt: rp.updated_at
                })),
                aiInsights: p.ai_insights || [],
                readinessScore: p.readiness_score || 0
            }));
            setProjects(formattedProjects);
            sessionStorage.setItem("kt_projects", JSON.stringify(formattedProjects));
        }
        setLoading(false);
        setInitialized(true);
    }, [projects.length]);

    // 1. Initial Load & Auth Change Load
    useEffect(() => {
        if (user) {
            console.log("[ProjectContext] Auth user detected, trigger project fetch.");
            fetchProjects();
        } else if (initialized) {
            // If user logged out, clear projects
            setProjects([]);
            sessionStorage.removeItem("kt_projects");
        }
    }, [user?.id]); // Depend on user ID specifically

    // 2. Realtime Subscriptions for Sync Across Modules
    useEffect(() => {
        if (!user) return;

        console.log("[ProjectContext] Setting up Realtime subscriptions...");

        // Subscribe to all relevant tables to sync changes across tabs/modules
        const projectsChannel = supabase
            .channel('project-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                console.log("[ProjectContext] Realtime: Project change detected, re-fetching...");
                fetchProjects(true); // Silent re-fetch
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => {
                console.log("[ProjectContext] Realtime: Member change detected, re-fetching...");
                fetchProjects(true);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_sections' }, () => {
                console.log("[ProjectContext] Realtime: Section change detected, re-fetching...");
                fetchProjects(true);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'section_links' }, () => {
                console.log("[ProjectContext] Realtime: Link change detected, re-fetching...");
                fetchProjects(true);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'receiver_section_progress' }, () => {
                console.log("[ProjectContext] Realtime: Receiver progress change detected, re-fetching...");
                fetchProjects(true);
            })
            .subscribe();

        return () => {
            console.log("[ProjectContext] Cleaning up Realtime subscriptions.");
            supabase.removeChannel(projectsChannel);
        };
    }, [user?.id, fetchProjects]);

    // Helper to notify all Admins
    const notifyAdmins = async (notificationData) => {
        const { data: admins, error } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'Admin');
        
        if (error || !admins || admins.length === 0) return;

        const notifications = admins.map(admin => ({
            user_id: admin.id,
            module: 'admin',
            ...notificationData,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
    };

    // Create a new project and sync to Supabase (Defaults to ACTIVE mode)
    const createProject = async (projectData) => {
        const { name, description, managerId, managerName, members, sections, deadline } = projectData;

        // 1. Insert Project - ALWAYS default to ACTIVE for new projects
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .insert([{
                name,
                description,
                manager_id: managerId,
                manager_name: managerName,
                status: 'Not Started',
                completion: 0,
                deadline: deadline || null,
                tech_stack: projectData.techStack || [],
                lifecycle_mode: 'ACTIVE',
                transition_type: 'INDIVIDUAL',
                transition_count: 0
            }])
            .select()
            .single();

        if (projectError) {
            console.error("Project insert error:", projectError);
            return null;
        }

        // 2. Insert Members - Store all as 'Contributor' initially
        const membersToInsert = (members || []).map(m => ({
            project_id: project.id,
            user_id: m.userId,
            kt_role: 'Contributor'
        }));

        if (membersToInsert.length > 0) {
            const { error: membersError } = await supabase.from("project_members").insert(membersToInsert);
            if (membersError) console.error("Members insert error:", membersError);
        }

        // 3. Insert Sections
        const sectionsToInsert = (sections || []).map((s, idx) => ({
            project_id: project.id,
            title: s.title,
            description: s.description || '',
            content: '',
            status: 'Draft',
            contributor_id: s.contributorId,
            order: idx + 1
        }));

        if (sectionsToInsert.length > 0) {
            const { error: sectionsError } = await supabase.from("project_sections").insert(sectionsToInsert);
            if (sectionsError) console.error("Sections insert error:", sectionsError);
        }

        // Re-fetch projects to update state
        await fetchProjects();

        // 4. Notify new members (excluding the manager)
        if (membersToInsert.length > 0) {
            const notifications = membersToInsert
                .filter(m => m.user_id !== managerId)
                .map(m => ({
                    user_id: m.user_id,
                    module: 'manager',
                    type: 'assignment',
                    title: 'New Project Assignment',
                    body: `You have been added to the project "${name}" as a Contributor.`,
                    project_id: project.id,
                    project_name: name,
                    is_read: false
                }));

            if (notifications.length > 0) {
                await supabase.from("notifications").insert(notifications);
            }
        }

        // 5. Notify all Admins about new project
        await notifyAdmins({
            type: 'project_created',
            title: 'New Project Created',
            body: `Project "${name}" has been created by ${managerName}.`,
            project_id: project.id,
            project_name: name
        });

        return project;
    };

    // Trigger a KT Transition (ACTIVE -> TRANSITION)
    const triggerTransition = async (projectId, transitionType, initiatorIds = [], receiverIds = [], deadline = null) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return false;

        console.log(`[ProjectContext] Triggering ${transitionType} transition for project: ${project.name}`);

        // 1. Update project mode
        const { error: projectError } = await supabase
            .from("projects")
            .update({
                lifecycle_mode: 'TRANSITION',
                transition_type: transitionType,
                status: 'In Progress',
                deadline: deadline || project.deadline
            })
            .eq("id", projectId);

        if (projectError) {
            console.error("Error triggering transition:", projectError);
            return false;
        }

        // 2. Assign KT Roles if applicable
        if (initiatorIds.length > 0 && receiverIds.length > 0) {
            // Update Initiators
            for (const iId of initiatorIds) {
                await supabase
                    .from("project_members")
                    .update({ kt_role: 'Initiator' })
                    .eq("project_id", projectId)
                    .eq("user_id", iId);
            }

            // Update Receivers
            for (const rId of receiverIds) {
                await supabase
                    .from("project_members")
                    .update({ kt_role: 'Receiver' })
                    .eq("project_id", projectId)
                    .eq("user_id", rId);
                
                // Initialize progress records for receiver
                await initReceiverProgress(projectId, rId);
            }

            // Log the transition in history
            await logTransition(
                projectId, 
                transitionType, 
                transitionType === 'FULL' ? 'FULL' : 'PARTIAL', 
                project.sections.map(s => s.id), 
                initiatorIds[0], // Primary initiator
                receiverIds,
                'STARTED'
            );
        }

        // 3. Notify Receivers
        const otherReceivers = receiverIds.filter(rId => rId !== user.id);
        if (otherReceivers.length > 0) {
            const notifications = otherReceivers.map(rId => ({
                user_id: rId,
                module: 'icr',
                type: 'transition',
                title: 'Transition Phase Started',
                body: `The project "${project.name}" has entered the transition phase. You are assigned as a Receiver.`,
                project_id: projectId,
                project_name: project.name,
                is_read: false
            }));
            await supabase.from("notifications").insert(notifications);
        }

        // 4. Notify all Admins
        await notifyAdmins({
            type: 'transition_triggered',
            title: `${transitionType} Transition Triggered`,
            body: `A ${transitionType.toLowerCase()} transition has been started for project "${project.name}".`,
            project_id: projectId,
            project_name: project.name
        });

        await fetchProjects();
        return true;
    };

    // Helper to calculate and sync project progress (completion & status)
    const syncProjectProgress = async (projectId, sections, receiverProgress = null) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !sections || sections.length === 0) return { completion: 0, status: project?.status || 'Not Started' };

        const total = sections.length;
        const isTransitionMode = project.lifecycleMode === 'TRANSITION' || project.lifecycleMode === 'REVERSE_KT';
        const rpData = receiverProgress || project.receiverProgress || [];

        let completion;

        if (isTransitionMode && rpData.length > 0) {
            // Multi-receiver aware: calculate average completion across all receivers
            const receivers = project.members.filter(m => m.ktRole === 'Receiver');
            if (receivers.length > 0) {
                let totalReceiverCompletion = 0;
                for (const receiver of receivers) {
                    let receiverWeightedSum = 0;
                    sections.forEach(s => {
                        const rp = rpData.find(r => r.sectionId === s.id && r.receiverId === receiver.userId);
                        const rpStatus = rp?.status || 'Not Started';
                        if (rpStatus === 'Understood') {
                            receiverWeightedSum += 1.0;
                        } else if (rpStatus === 'Ready for Review' || rpStatus === 'Presented') {
                            receiverWeightedSum += 0.5;
                        } else if (rpStatus === 'Needs Clarification') {
                            receiverWeightedSum += 0.25;
                        }
                    });
                    totalReceiverCompletion += Math.round((receiverWeightedSum / total) * 100);
                };
                completion = Math.round(totalReceiverCompletion / receivers.length);
            } else {
                completion = 0;
            }
        } else {
            // Active mode: use section status directly
            let weightedSum = 0;
            sections.forEach(s => {
                if (s.status === 'Understood' || (!isTransitionMode && s.status === 'Active')) {
                    weightedSum += 1.0;
                } else if (s.status === 'Ready for Review' || s.status === 'Presented') {
                    weightedSum += 0.5;
                } else if (s.status === 'Needs Clarification') {
                    weightedSum += 0.25;
                }
            });
            completion = Math.round((weightedSum / total) * 100);
        }

        // Transition status if work has started
        let nextStatus = project.status || 'Not Started';
        const hasWorkStarted = sections.some(s =>
            s.status !== 'Draft' ||
            (s.content && s.content.trim().length > 0) ||
            (s.attachments && s.attachments.length > 0)
        ) || rpData.some(rp => rp.status !== 'Not Started');

        if ((nextStatus === 'Not Started' || nextStatus === 'Active') && hasWorkStarted) {
            nextStatus = 'In Progress';
        }

        const { error } = await supabase.from("projects")
            .update({ completion, status: nextStatus })
            .eq("id", projectId);

        if (error) console.error("[ProjectContext] Failed to sync project progress:", error);

        return { completion, status: nextStatus };
    };

    // Update project status (e.g., Completed)
    const updateProjectStatus = async (projectId, status) => {
        const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
        if (error) {
            console.error("Supabase update status error:", error);
            return;
        }
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)));
    };

    // Update project details (generic)
    const updateProject = async (projectId, updates) => {
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
        if (updates.techStack !== undefined) dbUpdates.tech_stack = updates.techStack;

        const { error } = await supabase.from("projects").update(dbUpdates).eq("id", projectId);
        if (error) {
            console.error("Supabase update project error:", error);
            return;
        }
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));
    };

    // Update a section's status/content
    const updateSectionStatus = async (projectId, sectionId, status, content = null) => {
        const updates = { status };
        if (content !== null) updates.content = content;

        const { error } = await supabase.from("project_sections").update(updates).eq("id", sectionId);
        if (error) {
            console.error("Supabase update section error:", error);
            return;
        }

        // Find the project and calculate new stats
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedSections = project.sections.map((s) => {
            if (s.id === sectionId) {
                return { ...s, status, ...(content !== null && { content }) };
            }
            return s;
        });

        const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

        setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
        );
    };

    // Remove an attachment from a section
    const removeAttachment = async (projectId, sectionId, attachmentId) => {
        const { error } = await supabase.from("section_attachments").delete().eq("id", attachmentId);
        if (error) {
            console.error("Supabase delete attachment error:", error);
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = project.sections.map((s) => {
                if (s.id === sectionId) {
                    return { ...s, attachments: s.attachments.filter((a) => a.id !== attachmentId) };
                }
                return s;
            });

            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    // Add a comment to a section
    const addComment = async (projectId, sectionId, comment) => {
        const { userId, userName, text } = comment;
        const { data, error } = await supabase
            .from("section_comments")
            .insert([{
                section_id: sectionId,
                user_id: userId,
                user_name: userName,
                text,
                timestamp: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase add comment error:", error);
            return;
        }

        setProjects((prev) =>
            prev.map((p) => {
                if (p.id === projectId) {
                    const updatedSections = p.sections.map((s) => {
                        if (s.id === sectionId) {
                            const newComment = {
                                id: data.id,
                                userId: data.user_id,
                                userName: data.user_name,
                                text: data.text,
                                timestamp: data.timestamp
                            };
                            return { ...s, comments: [...(s.comments || []), newComment] };
                        }
                        return s;
                    });
                    return { ...p, sections: updatedSections };
                }
                return p;
            })
        );
    };

    // Transition a project from TRANSITION mode back to ACTIVE (converts ALL receivers)
    const finalizeTransition = async (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        console.log(`[ProjectContext] Finalizing full transition for project: ${project.name}`);

        // 1. Update project mode and reset status for active phase
        const { error: projectError } = await supabase
            .from("projects")
            .update({
                lifecycle_mode: 'ACTIVE',
                status: 'Active',
                transition_count: (project.transitionCount || 0) + 1
            })
            .eq("id", projectId);

        if (projectError) {
            console.error("Error updating project mode:", projectError);
            return;
        }

        // 2. Convert ALL Receivers to Contributors
        const { error: membersError } = await supabase
            .from("project_members")
            .update({ kt_role: 'Contributor' })
            .eq("project_id", projectId)
            .eq("kt_role", 'Receiver');

        if (membersError) {
            console.error("Error updating member roles:", membersError);
        }

        // 3. Reset section statuses to 'Active'
        const { error: sectionsError } = await supabase
            .from("project_sections")
            .update({ status: 'Active' })
            .eq("project_id", projectId);

        if (sectionsError) {
            console.error("Error resetting section statuses:", sectionsError);
        }

        await fetchProjects();
    };

    // Toggle Reverse KT mode
    const setReverseKTMode = async (projectId, isEnabled) => {
        const newMode = isEnabled ? 'REVERSE_KT' : 'TRANSITION';
        const { error } = await supabase
            .from("projects")
            .update({ lifecycle_mode: newMode })
            .eq("id", projectId);

        if (error) {
            console.error("Error setting Reverse KT mode:", error);
            return;
        }

        await fetchProjects();
    };

    // Update a specific receiver's progress on a specific section
    const updateReceiverProgress = async (projectId, sectionId, receiverId, newStatus) => {
        // Upsert the receiver's progress record
        const { error } = await supabase
            .from('receiver_section_progress')
            .upsert({
                project_id: projectId,
                section_id: sectionId,
                receiver_id: receiverId,
                status: newStatus,
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_id,receiver_id' });

        if (error) {
            console.error("Error updating receiver progress:", error);
            return;
        }

        // Update local state optimistically
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedProgress = [...(project.receiverProgress || [])];
        const existingIdx = updatedProgress.findIndex(rp => rp.sectionId === sectionId && rp.receiverId === receiverId);
        if (existingIdx >= 0) {
            updatedProgress[existingIdx] = { ...updatedProgress[existingIdx], status: newStatus };
        } else {
            updatedProgress.push({ sectionId, receiverId, status: newStatus });
        }

        // Sync project progress with updated receiver data
        const { completion, status: nextStatus } = await syncProjectProgress(projectId, project.sections, updatedProgress);

        setProjects(prev =>
            prev.map(p => p.id === projectId
                ? { ...p, receiverProgress: updatedProgress, completion, status: nextStatus }
                : p
            )
        );
    };

    // Get a specific receiver's completion percentage
    const getReceiverCompletion = (projectId, receiverId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !project.sections || project.sections.length === 0) return 0;

        const rpData = project.receiverProgress || [];
        const total = project.sections.length;
        let weightedSum = 0;

        project.sections.forEach(s => {
            const rp = rpData.find(r => r.sectionId === s.id && r.receiverId === receiverId);
            const rpStatus = rp?.status || 'Not Started';
            if (rpStatus === 'Understood') {
                weightedSum += 1.0;
            } else if (rpStatus === 'Ready for Review' || rpStatus === 'Presented') {
                weightedSum += 0.5;
            } else if (rpStatus === 'Needs Clarification') {
                weightedSum += 0.25;
            }
        });

        return Math.round((weightedSum / total) * 100);
    };

    // Initialize receiver progress records (e.g., when adding a new receiver to a project)
    const initReceiverProgress = async (projectId, receiverId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const progressRecords = project.sections.map(s => ({
            project_id: projectId,
            section_id: s.id,
            receiver_id: receiverId,
            status: 'Not Started'
        }));

        if (progressRecords.length > 0) {
            const { error } = await supabase
                .from('receiver_section_progress')
                .upsert(progressRecords, { onConflict: 'section_id,receiver_id' });
            if (error) console.error("Error initializing receiver progress:", error);
        }

        await fetchProjects();
    };

    // Log a transition event for history tracking
    const logTransition = async (projectId, type, scope, sections, initiatorId, receivers, status = 'STARTED') => {
        const { error } = await supabase
            .from("project_transitions")
            .insert([{
                project_id: projectId,
                transition_type: type,
                scope: scope,
                selected_sections: sections,
                initiator_id: initiatorId,
                receiver_ids: receivers,
                status: status,
                started_at: new Date().toISOString(),
                completed_at: status === 'COMPLETED' ? new Date().toISOString() : null
            }]);

        if (error) {
            console.error("[ProjectContext] Error logging transition:", error);
        }
    };

    // Update transition log status
    const updateTransitionLog = async (projectId, status) => {
        const { data, error: findError } = await supabase
            .from("project_transitions")
            .select("id")
            .eq("project_id", projectId)
            .eq("status", "STARTED")
            .order("started_at", { ascending: false })
            .limit(1);

        if (!findError && data?.length > 0) {
            const { error: updateError } = await supabase
                .from("project_transitions")
                .update({ 
                    status: status, 
                    completed_at: status === 'COMPLETED' ? new Date().toISOString() : null 
                })
                .eq("id", data[0].id);
            if (updateError) console.error("[ProjectContext] Error updating transition log:", updateError);
        }
    };

    // Finalize transition for a SPECIFIC receiver (per-receiver graduation)
    const finalizeReceiverTransition = async (projectId, receiverId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        console.log(`[ProjectContext] Finalizing transition for receiver: ${receiverId} on project: ${project.name}`);

        // 1. Convert this specific receiver to Contributor
        const { error: membersError } = await supabase
            .from('project_members')
            .update({ kt_role: 'Contributor' })
            .eq('project_id', projectId)
            .eq('user_id', receiverId)
            .eq('kt_role', 'Receiver');

        if (membersError) {
            console.error("Error updating member role:", membersError);
            return;
        }

        // 2. Check if there are any remaining receivers
        const { data: remainingReceivers, error: checkError } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('kt_role', 'Receiver');

        if (checkError) {
            console.error("Error checking remaining receivers:", checkError);
        }

        // 3. If no more receivers, switch project back to ACTIVE
        if (!remainingReceivers || remainingReceivers.length === 0) {
            const { error: projectError } = await supabase
                .from('projects')
                .update({
                    lifecycle_mode: 'ACTIVE',
                    status: 'In Progress',
                    transition_count: (project.transitionCount || 0) + 1
                })
                .eq('id', projectId);

            if (projectError) {
                console.error("Error updating project mode:", projectError);
            }

            // Reset section statuses to Active
            const { error: sectionsError } = await supabase
                .from('project_sections')
                .update({ status: 'Active' })
                .eq('project_id', projectId);

            if (sectionsError) {
                console.error("Error resetting section statuses:", sectionsError);
            }

            // Update transition log
            await updateTransitionLog(projectId, 'COMPLETED');
        }

        // 4. Notify the graduating receiver
        await supabase.from("notifications").insert([{
            user_id: receiverId,
            module: 'icr',
            type: 'graduation',
            title: 'Transition Finalized',
            body: `Your transition for project "${project.name}" is complete. You have graduated to a Contributor role.`,
            project_id: projectId,
            project_name: project.name,
            is_read: false
        }]);

        await fetchProjects();
    };

    // Finalize transition for a MANAGER (handover ownership)
    const finalizeManagerHandover = async (projectId, newManagerId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return false;

        console.log(`[ProjectContext] Finalizing manager handover for project: ${project.name}`);

        const newManager = project.members.find(m => m.userId === newManagerId);
        if (!newManager) {
            console.error("New manager not found in project members");
            return false;
        }

        // 1. Update project metadata and revert mode
        const { error: projectError } = await supabase
            .from("projects")
            .update({
                manager_id: newManager.userId,
                manager_name: newManager.name,
                lifecycle_mode: 'ACTIVE',
                transition_type: 'INDIVIDUAL', // Reset to default
                status: 'Active',
                transition_count: (project.transitionCount || 0) + 1
            })
            .eq("id", projectId);

        if (projectError) {
            console.error("Error updating project manager:", projectError);
            return false;
        }

        // 2. Convert ALL members to Contributor (clears Initiator/Receiver roles)
        const { error: membersError } = await supabase
            .from("project_members")
            .update({ kt_role: 'Contributor' })
            .eq("project_id", projectId);

        if (membersError) {
            console.error("Error resetting member roles:", membersError);
        }

        // 3. Reset section statuses to 'Active'
        const { error: sectionsError } = await supabase
            .from("project_sections")
            .update({ status: 'Active' })
            .eq("project_id", projectId);

        if (sectionsError) {
            console.error("Error resetting section statuses:", sectionsError);
        }

        // 4. Update transition log (if any started)
        await updateTransitionLog(projectId, 'COMPLETED');

        // 5. Notify the new Manager
        await supabase.from("notifications").insert([{
            user_id: newManagerId,
            module: 'manager',
            type: 'assignment',
            title: 'New Manager Assignment',
            body: `You have been assigned as the primary manager for Project "${project.name}".`,
            project_id: projectId,
            project_name: project.name,
            is_read: false
        }]);

        await fetchProjects();
        return true;
    };

    // Archive a project
    const archiveProject = async (projectId) => {
        const { error } = await supabase
            .from("projects")
            .update({ status: 'Archived' })
            .eq("id", projectId);

        if (error) {
            console.error("[ProjectContext] Error archiving project:", error);
            return false;
        }

        await fetchProjects();
        return true;
    };

    // Soft delete a project
    const deleteProject = async (projectId) => {
        const { error } = await supabase.from("projects").update({ status: 'Deleted' }).eq("id", projectId);
        if (error) {
            console.error("Supabase soft delete error:", error);
            return;
        }
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
    };

    // Update member details (e.g., functional role)
    const updateMember = async (projectId, memberId, updates) => {
        // Map UI field names to DB names if necessary
        const dbUpdates = {};
        if (updates.ktRole !== undefined) dbUpdates.kt_role = updates.ktRole;
        // functionalRole updates are ignored as we fetch from users table now

        const { error } = await supabase.from("project_members").update(dbUpdates).eq("id", memberId);
        if (error) {
            console.error("Supabase update member error:", error);
            return;
        }

        setProjects((prev) =>
            prev.map((p) => {
                if (p.id === projectId) {
                    const updatedMembers = p.members.map((m) => {
                        if (m.id === memberId) {
                            return { ...m, ...updates };
                        }
                        return m;
                    });
                    return { ...p, members: updatedMembers };
                }
                return p;
            })
        );
    };

    // Add a new member to the project
    const addMember = async (projectId, memberData) => {
        const { userId, ktRole, functionalRole } = memberData;
        const { data, error } = await supabase
            .from("project_members")
            .insert([{
                project_id: projectId,
                user_id: userId,
                kt_role: ktRole
            }])
            .select(`
                *,
                users (name, role)
            `)
            .single();

        if (error) {
            console.error("Supabase add member error:", error);
            return;
        }

        const formattedMember = {
            id: data.id,
            userId: data.user_id,
            name: data.users?.name || 'Unknown',
            ktRole: data.kt_role,
            functionalRole: data.users?.role || 'Member'
        };

        const projectRecord = projects.find(p => p.id === projectId);
        if (projectRecord && userId !== user.id) {
            // Notify the new member
            await supabase.from("notifications").insert([{
                user_id: userId,
                module: 'icr',
                type: 'assignment',
                title: 'New Project Assignment',
                body: `You have been added to the project "${projectRecord.name}" as a ${ktRole}.`,
                project_id: projectId,
                project_name: projectRecord.name,
                is_read: false
            }]);
        }

        setProjects((prev) =>
            prev.map((p) => {
                if (p.id === projectId) {
                    return { ...p, members: [...p.members, formattedMember] };
                }
                return p;
            })
        );
    };

    // Add an attachment to a section
    const addAttachment = async (projectId, sectionId, attachment) => {
        const { fileName, fileSize, url, uploadedBy } = attachment;
        const { data, error } = await supabase
            .from("section_attachments")
            .insert([{
                section_id: sectionId,
                file_name: fileName,
                file_size: fileSize,
                url,
                uploaded_by_name: uploadedBy,
                uploaded_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase add attachment error:", error);
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = project.sections.map((s) => {
                if (s.id === sectionId) {
                    const newAttachment = {
                        id: data.id,
                        fileName: data.file_name,
                        fileSize: data.file_size,
                        url: data.url,
                        uploadedByName: data.uploaded_by_name,
                        uploadedAt: data.uploaded_at
                    };
                    return { ...s, attachments: [...(s.attachments || []), newAttachment] };
                }
                return s;
            });

            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    // Add a new section to a project
    const addSection = async (projectId, sectionData) => {
        const { title, description, contributorId, order } = sectionData;
        const { data, error } = await supabase
            .from("project_sections")
            .insert([{
                project_id: projectId,
                title,
                description: description || '',
                content: '',
                status: 'Draft',
                contributor_id: contributorId,
                order: order || 0
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase add section error:", error);
            return;
        }

        const newSection = {
            id: data.id,
            title: data.title,
            description: data.description,
            content: data.content,
            status: data.status,
            contributorId: data.contributor_id,
            order: data.order,
            attachments: [],
            comments: [],
            links: []
        };

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = [...project.sections, newSection].sort((a, b) => (a.order || 0) - (b.order || 0));
            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    // Remove a section from a project
    const removeSection = async (projectId, sectionId) => {
        const { error } = await supabase.from("project_sections").delete().eq("id", sectionId);
        if (error) {
            console.error("Supabase delete section error:", error);
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = project.sections.filter(s => s.id !== sectionId);
            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    // Update generic section details (e.g., contributor assignment)
    const updateSection = async (projectId, sectionId, updates) => {
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.contributorId !== undefined) dbUpdates.contributor_id = updates.contributorId;
        if (updates.order !== undefined) dbUpdates.order = updates.order;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        const { error } = await supabase.from("project_sections").update(dbUpdates).eq("id", sectionId);
        if (error) {
            console.error("Supabase update section error:", error);
            return;
        }

        setProjects((prev) =>
            prev.map((p) => {
                if (p.id === projectId) {
                    const updatedSections = p.sections.map((s) => {
                        if (s.id === sectionId) {
                            return { ...s, ...updates };
                        }
                        return s;
                    }).sort((a, b) => (a.order || 0) - (b.order || 0));
                    return { ...p, sections: updatedSections };
                }
                return p;
            })
        );
    };

    // Remove a member from the project
    const removeMember = async (projectId, memberId) => {
        const { error } = await supabase.from("project_members").delete().eq("id", memberId);
        if (error) {
            console.error("Supabase delete member error:", error);
            return;
        }

        setProjects((prev) =>
            prev.map((p) => {
                if (p.id === projectId) {
                    const updatedMembers = p.members.filter((m) => m.id !== memberId);
                    return { ...p, members: updatedMembers };
                }
                return p;
            })
        );
    };

    // Add a link to a section
    const addLink = async (projectId, sectionId, linkData) => {
        const { title, url, createdBy } = linkData;
        const { data, error } = await supabase
            .from("section_links")
            .insert([{
                section_id: sectionId,
                title,
                url,
                created_by_name: createdBy,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase add link error:", error);
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = project.sections.map((s) => {
                if (s.id === sectionId) {
                    const newLink = {
                        id: data.id,
                        title: data.title,
                        url: data.url,
                        createdByName: data.created_by_name,
                        createdAt: data.created_at
                    };
                    return { ...s, links: [...(s.links || []), newLink] };
                }
                return s;
            });

            // We don't necessarily need to sync progress for just a link, 
            // but let's do it if it matches the pattern
            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    // Remove a link from a section
    const removeLink = async (projectId, sectionId, linkId) => {
        const { error } = await supabase.from("section_links").delete().eq("id", linkId);
        if (error) {
            console.error("Supabase delete link error:", error);
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedSections = project.sections.map((s) => {
                if (s.id === sectionId) {
                    return { ...s, links: (s.links || []).filter((l) => l.id !== linkId) };
                }
                return s;
            });

            const { completion, status: nextStatus } = await syncProjectProgress(projectId, updatedSections);

            setProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, sections: updatedSections, completion, status: nextStatus } : p))
            );
        }
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                createProject,
                updateProjectStatus,
                updateSectionStatus,
                addComment,
                deleteProject,
                updateMember,
                addMember,
                removeMember,
                addAttachment,
                removeAttachment,
                addLink,
                removeLink,
                addSection,
                removeSection,
                updateSection,
                updateProject,
                triggerTransition,
                finalizeTransition,
                finalizeReceiverTransition,
                finalizeManagerHandover,
                archiveProject,
                setReverseKTMode,
                updateReceiverProgress,
                getReceiverCompletion,
                initReceiverProgress,
                updateSectionClarity: async (projectId, sectionId, clarityData) => {
                    const { score, suggestions } = clarityData;
                    const { error } = await supabase.from("project_sections").update({ 
                        clarity_score: score, 
                        clarity_suggestions: suggestions 
                    }).eq("id", sectionId);
                    
                    if (!error) {
                        setProjects(prev => prev.map(p => {
                            if (p.id === projectId) {
                                return {
                                    ...p,
                                    sections: p.sections.map(s => s.id === sectionId ? { ...s, clarityScore: score, claritySuggestions: suggestions } : s)
                                };
                            }
                            return p;
                        }));
                    }
                },
                updateSectionQuiz: async (projectId, sectionId, quiz) => {
                    const { error } = await supabase.from("project_sections").update({ ai_quiz: quiz }).eq("id", sectionId);
                    if (!error) {
                        setProjects(prev => prev.map(p => p.id === projectId ? {
                            ...p,
                            sections: p.sections.map(s => s.id === sectionId ? { ...s, aiQuiz: quiz } : s)
                        } : p));
                    }
                },
                updateProjectAIInsights: async (projectId, insights) => {
                    const { error } = await supabase.from("projects").update({ ai_insights: insights }).eq("id", projectId);
                    if (!error) {
                        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, aiInsights: insights } : p));
                    }
                },
                updateReadinessScore: async (projectId, score) => {
                    const { error } = await supabase.from("projects").update({ readiness_score: score }).eq("id", projectId);
                    if (!error) {
                        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, readinessScore: score } : p));
                    }
                },
                fetchProjects,
                loading
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
    return ctx;
};

