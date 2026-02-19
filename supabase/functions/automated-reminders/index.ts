import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Fetch all data needed
        const { data: sections, error: sectionsError } = await supabase
            .from('project_sections')
            .select(`
                id,
                title,
                status,
                contributor_id,
                projects (
                    id,
                    name,
                    deadline
                )
            `)
            .neq('status', 'Understood')

        if (sectionsError) throw sectionsError

        const { data: members, error: membersError } = await supabase
            .from('project_members')
            .select(`
                project_id,
                user_id,
                kt_role,
                users (
                    id,
                    name,
                    email,
                    username
                )
            `)

        if (membersError) throw membersError

        // 2. Process notifications
        // We group by username as requested
        const notifications = new Map() // username -> { name: string, email: string, items: any[] }

        const getAndRegisterUser = (userId: string) => {
            const member = members.find(m => m.users.id === userId)
            if (!member || !member.users) return null
            
            const username = member.users.username
            if (!notifications.has(username)) {
                notifications.set(username, {
                    name: member.users.name,
                    email: member.users.email || member.users.username,
                    items: []
                })
            }
            return notifications.get(username)
        }

        sections.forEach(section => {
            const project = Array.isArray(section.projects) ? section.projects[0] : section.projects
            if (!project) return

            // A. Notify Contributor (if status is Draft or Needs Clarification)
            if (['Draft', 'Needs Clarification'].includes(section.status)) {
                const userData = getAndRegisterUser(section.contributor_id)
                if (userData) {
                    userData.items.push({
                        project: project.name,
                        deadline: project.deadline,
                        section: section.title,
                        role: 'Contributor',
                        reason: section.status === 'Draft' ? 'Section is still in Draft' : 'Receiver requested clarification'
                    })
                }
            }

            // B. Notify Receivers (if status is Ready for Review)
            if (section.status === 'Ready for Review') {
                const projectReceivers = members.filter(m => m.project_id === project.id && m.kt_role === 'Receiver')
                
                projectReceivers.forEach(r => {
                    const userData = getAndRegisterUser(r.user_id)
                    if (userData) {
                        // Avoid adding the same section twice for the same user
                        const alreadyAdded = userData.items.find((i: any) => i.section === section.title && i.project === project.name)
                        if (!alreadyAdded) {
                            userData.items.push({
                                project: project.name,
                                deadline: project.deadline,
                                section: section.title,
                                role: 'Receiver',
                                reason: 'Content is ready for your review'
                            })
                        }
                    }
                })
            }
        })

        // C. Notify Manager to sign off if ALL sections in a project are 'Understood'
        // Fetch active projects (not yet completed or signed off)
        const { data: activeProjects, error: activeProjectsError } = await supabase
            .from('projects')
            .select('id, name, deadline, status, manager_id')
            .not('status', 'in', '("Completed","Signed Off")')

        if (activeProjectsError) throw activeProjectsError

        for (const project of (activeProjects ?? [])) {
            if (!project.manager_id) continue

            // Check all sections for this project
            const { data: projectSections, error: psError } = await supabase
                .from('project_sections')
                .select('id, status')
                .eq('project_id', project.id)

            if (psError || !projectSections || projectSections.length === 0) continue

            // Skip if any section is not yet 'Understood'
            const allUnderstood = projectSections.every(s => s.status === 'Understood')
            if (!allUnderstood) continue

            // Fetch the manager's user record
            const { data: managerUser, error: managerError } = await supabase
                .from('users')
                .select('id, name, email, username')
                .eq('id', project.manager_id)
                .single()

            if (managerError || !managerUser) continue

            const username = managerUser.username
            if (!notifications.has(username)) {
                notifications.set(username, {
                    name: managerUser.name,
                    email: managerUser.email || managerUser.username,
                    items: []
                })
            }

            const userData = notifications.get(username)

            // Avoid duplicate sign-off reminders for the same project
            const alreadyAdded = userData.items.find((i: any) => i.project === project.name && i.role === 'Manager')
            if (!alreadyAdded) {
                userData.items.push({
                    project: project.name,
                    deadline: project.deadline,
                    section: 'All sections reviewed & understood',
                    role: 'Manager',
                    reason: 'All sections have been marked as Understood — please sign off the project'
                })
            }
        }

        // 3. Send emails via Resend
        const results = []
        for (const [username, data] of notifications.entries()) {
            // Only send if there are items to notify about
            if (data.items.length === 0) continue

            const targetEmail = data.email
            const itemsHtml = data.items.map((i: any) => {
                const deadlineStr = i.deadline 
                    ? new Date(i.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not set';

                const isSignOff = i.role === 'Manager'
                const borderColor = isSignOff ? '#10b981' : '#3b82f6'
                const badgeBg    = isSignOff ? '#d1fae5' : '#dbeafe'
                const badgeColor = isSignOff ? '#065f46' : '#1e40af'

                return `
                <li style="margin-bottom: 12px; list-style: none; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid ${borderColor};">
                  <div style="font-weight: bold; color: #1e293b; font-size: 16px; margin-bottom: 2px;">${i.project}</div>
                  <div style="font-size: 11px; color: #ef4444; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Deadline: ${deadlineStr}</div>
                  <div style="font-size: 14px; color: #475569;">${isSignOff ? '✅ ' : ''}${i.section}</div>
                  <div style="font-size: 12px; margin-top: 8px;">
                    <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${i.role}</span>
                    <span style="margin-left: 8px; color: #64748b; font-style: italic;">${i.reason}</span>
                  </div>
                </li>
            `}).join('')

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'KT System <notifications@yourverifieddomain.com>',
                    to: [targetEmail],
                    subject: 'Action Required: Knowledge Transfer Update',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                          <h2 style="color: #333;">Hello ${data.name},</h2>
                          <p>The following items in the Knowledge Transfer Management System require your attention (User: ${username}):</p>
                          <ul style="padding: 0;">${itemsHtml}</ul>
                          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                          <p style="font-size: 12px; color: #999;">This is an automated reminder. Please log in to your dashboard to take action.</p>
                        </div>
                    `,
                }),
            })

            const resData = await res.json()
            results.push({ username, email: targetEmail, status: res.status, resData })
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
