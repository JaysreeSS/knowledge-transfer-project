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
                    functional_role,
                    users (name)
                ),
                project_sections (
                    id,
                    title,
                    description,
                    content,
                    status,
                    contributor_id,
                    order,
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
                transition_count,
                receiver_section_progress (
                    id,
                    section_id,
                    receiver_id,
                    status,
                    updated_at
                )
            `)
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
                lifecycleMode: p.lifecycle_mode || 'ACTIVE',
                transitionCount: p.transition_count || 0,
                members: (p.project_members || []).map(m => ({
                    id: m.id,
                    userId: m.user_id,
                    name: m.users?.name || 'Unknown',
                    ktRole: m.kt_role,
                    functionalRole: m.functional_role
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
                        }))
                    })),
                receiverProgress: (p.receiver_section_progress || []).map(rp => ({
                    id: rp.id,
                    sectionId: rp.section_id,
                    receiverId: rp.receiver_id,
                    status: rp.status,
                    updatedAt: rp.updated_at
                }))
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

    // Create a new project and sync to Supabase
    const createProject = async (projectData) => {
        const { name, description, managerId, managerName, members, sections, deadline, category } = projectData;

        // 1. Insert Project
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
                category: category || 'General',
                lifecycle_mode: projectData.lifecycleMode || (members.some(m => m.ktRole === 'Receiver') ? 'TRANSITION' : 'ACTIVE')
            }])
            .select()
            .single();

        if (projectError) {
            console.error("Project insert error:", projectError);
            return null;
        }

        // 2. Insert Members
        const membersToInsert = (members || []).map(m => ({
            project_id: project.id,
            user_id: m.userId,
            kt_role: m.ktRole,
            functional_role: m.functionalRole
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

        // Re-fetch projects to update state with full project data (including joined names)
        await fetchProjects();

        // If there are receivers, auto-init their progress records
        if (project && members.some(m => m.ktRole === 'Receiver')) {
            const receivers = members.filter(m => m.ktRole === 'Receiver');
            const { data: insertedSections } = await supabase
                .from('project_sections')
                .select('id')
                .eq('project_id', project.id);

            if (insertedSections && insertedSections.length > 0) {
                const progressRecords = [];
                for (const receiver of receivers) {
                    for (const sec of insertedSections) {
                        progressRecords.push({
                            project_id: project.id,
                            section_id: sec.id,
                            receiver_id: receiver.userId,
                            status: 'Not Started'
                        });
                    }
                }
                if (progressRecords.length > 0) {
                    const { error: rpError } = await supabase
                        .from('receiver_section_progress')
                        .upsert(progressRecords, { onConflict: 'section_id,receiver_id' });
                    if (rpError) console.error("Error initializing receiver progress:", rpError);
                }
                await fetchProjects();
            }
        }

        return project;
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
                status: 'In Progress',
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
        }

        await fetchProjects();
    };

    // Delete a project
    const deleteProject = async (projectId) => {
        // Assuming foreign keys are set to ON DELETE CASCADE
        const { error } = await supabase.from("projects").delete().eq("id", projectId);
        if (error) {
            console.error("Supabase delete error:", error);
            return;
        }
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
    };

    // Update member details (e.g., functional role)
    const updateMember = async (projectId, memberId, updates) => {
        // Map UI field names to DB names if necessary
        const dbUpdates = {};
        if (updates.functionalRole !== undefined) dbUpdates.functional_role = updates.functionalRole;
        if (updates.ktRole !== undefined) dbUpdates.kt_role = updates.ktRole;

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
                kt_role: ktRole,
                functional_role: functionalRole
            }])
            .select(`
                *,
                users (name)
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
            functionalRole: data.functional_role
        };

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
                finalizeTransition,
                finalizeReceiverTransition,
                setReverseKTMode,
                updateReceiverProgress,
                getReceiverCompletion,
                initReceiverProgress,
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

