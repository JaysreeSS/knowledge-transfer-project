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
                    )
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
                        }))
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
            .subscribe();

        return () => {
            console.log("[ProjectContext] Cleaning up Realtime subscriptions.");
            supabase.removeChannel(projectsChannel);
        };
    }, [user?.id, fetchProjects]);

    // Create a new project and sync to Supabase
    const createProject = async (projectData) => {
        const { name, description, managerId, managerName, members, sections, deadline } = projectData;

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
                deadline: deadline || null
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
        return project;
    };

    // Helper to calculate and sync project progress (completion & status)
    const syncProjectProgress = async (projectId, sections) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !sections || sections.length === 0) return { completion: 0, status: project?.status || 'Not Started' };

        const total = sections.length;

        // Granular completion calculation:
        // - Understood: 100% of section weight (1.0)
        // - Ready for Review: 50% of section weight (0.5)
        // - Needs Clarification: 50% of section weight (0.5) 
        // - Others: 0%
        let weightedSum = 0;
        sections.forEach(s => {
            if (s.status === 'Understood') {
                weightedSum += 1.0;
            } else if (s.status === 'Ready for Review' || s.status === 'Needs Clarification') {
                weightedSum += 0.5;
            }
        });

        const completion = Math.round((weightedSum / total) * 100);

        // Transition status if work has started
        let nextStatus = project.status || 'Not Started';
        const hasWorkStarted = sections.some(s =>
            s.status !== 'Draft' ||
            (s.content && s.content.trim().length > 0) ||
            (s.attachments && s.attachments.length > 0)
        );

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
            comments: []
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
                addSection,
                removeSection,
                updateSection,
                updateProject,
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

