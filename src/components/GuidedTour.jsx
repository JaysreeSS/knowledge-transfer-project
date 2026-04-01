import React, { useState, useEffect, useMemo } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * GuidedTour Component — react-joyride v3
 * 
 * v3 API notes:
 *   - onEvent replaces callback
 *   - Skip button is controlled via options.buttons = ['back', 'primary', 'skip']
 *   - showProgress is inside options, NOT a top-level prop
 *   - overlayClickAction: false instead of disableOverlayClose
 */
export default function GuidedTour({ role, manualStartCount = 0 }) {
    const { user, completeOnboarding } = useAuth();
    const { theme } = useTheme();
    const [run, setRun] = useState(false);

    const roleKey = role === 'System Admin' ? 'System Admin' : (role === 'Manager' ? 'Manager' : 'ICR');

    useEffect(() => {
        console.log('[GuidedTour] Effect: manualStartCount=', manualStartCount, 'first_login=', user?.first_login);
        if (manualStartCount > 0 || (user && user.first_login)) {
            console.log('[GuidedTour] Starting tour for role:', roleKey);
            setRun(true);
        }
    }, [manualStartCount, user?.first_login]);

    // ─────────────────────────────────────────────────────────────
    // STEP DEFINITIONS — Comprehensive coverage of all pages
    // ─────────────────────────────────────────────────────────────
    const allSteps = useMemo(() => ({

        // ═══════════════════════════════════════════════════════
        // ADMIN MODULE — System Administration & Templates
        // ═══════════════════════════════════════════════════════
        'System Admin': [
            {
                target: '#admin-welcome-step',
                title: '👋 Welcome, Administrator',
                content: 'This is your system control center. From here you can monitor all users, projects, and system health. You control the overarching structure of the Knowledge Transfer application.',
                disableBeacon: true,
                placement: 'bottom',
            },
            {
                target: '#admin-stats-grid',
                title: '📊 Live System Analytics',
                content: 'These metrics show real-time system usage: total registered users, active vs transition phase projects, and defined documentation templates.',
                placement: 'bottom',
            },
            {
                target: '#admin-nav-users',
                title: '👥 User Lifecycle Management',
                content: 'Click "Users" to provision accounts. You can assign System Admin, Manager, or Functional roles. Remember: Managers orchestrate projects, while Functional roles (ICR) execute them.',
                placement: 'right',
            },
            {
                target: '#admin-nav-sections',
                title: '📋 Standardized Templates',
                content: 'Click "Sections" to define master documentation templates (e.g., Codebase Architecture, Deployment Steps). Managers will pull from these templates when creating new KT projects, ensuring organizational consistency.',
                placement: 'right',
            },
            {
                target: '#admin-nav-projects',
                title: '🗂️ Global Oversight',
                content: 'Click "Projects" for an omniscient view of every KT taking place across the company. You can monitor overall completion progress and intervene if projects stall.',
                placement: 'right',
            },
            {
                target: '#admin-nav-settings',
                title: '⚙️ Deep System Configuration',
                content: 'Click "Settings" to customize the platform. Here you can tweak the UI theme, set notification broadcast rules, and define strict application workflows and access policies.',
                placement: 'right',
            },
            {
                target: '#admin-notifications',
                title: '🔔 Admin Action Center',
                content: 'The bell icon aggregates system-level alerts and administrative actions that require your approval.',
                placement: 'left',
            },
        ],

        // ═══════════════════════════════════════════════════════
        // MANAGER MODULE — Orchestration & AI Auditing
        // ═══════════════════════════════════════════════════════
        'Manager': [
            {
                target: '#manager-dashboard-title',
                title: '👋 Welcome, Manager',
                content: 'Your dashboard is the orchestration layer. Here you launch KT projects, monitor team velocity, and leverage our new Gemini AI to ensure documentation quality.',
                disableBeacon: true,
                placement: 'bottom',
            },
            {
                target: '#manager-nav-all-projects',
                title: '📂 Project Portfolio',
                content: 'Click "All Projects" to see all KTs you oversee. You can track progress across Active drafting and Transition reading phases at a glance.',
                placement: 'right',
            },
            {
                target: '#manager-create-project-btn',
                title: '🚀 Launching a KT',
                content: 'The "Start New Project" button opens a 3-step wizard. You\'ll set deadlines, assign Initiators (owners), Contributors (writers), and Receivers (readers), and map out the required documentation sections.',
                placement: 'bottom',
            },
            {
                target: '#manager-nav-all-projects',
                title: '🤖 AI Transition Audits',
                content: 'Once a project is underway, click into it to run an "AI Readiness Audit". Our integrated Gemini LLM will scan the docs, detect knowledge gaps, evaluate clarity, and provide a strategic transition plan—before the deadline.',
                placement: 'right',
            },
            {
                target: '#manager-nav-my-handovers',
                title: '📤 Contributor Duties',
                content: 'If you are assigned to actually *write* documentation in a project, you\'ll find those tasks under "My Handovers". You can use AI to help draft and format your markdown.',
                placement: 'right',
            },
            {
                target: '#manager-nav-my-onboardings',
                title: '📥 Receiver Duties',
                content: 'If you are learning a new system, check "My Onboardings". You can read docs, take AI-generated quizzes to test your knowledge, and request clarifications from the authors.',
                placement: 'right',
            },
            {
                target: '#manager-notifications',
                title: '🔔 Velocity Alerts',
                content: 'This hub notifies you when sections are ready for review, or when team members are stuck and requesting clarifications.',
                placement: 'left',
            },
        ],

        // ═══════════════════════════════════════════════════════
        // ICR MODULE — Execution, AI Drafting & Learning
        // ═══════════════════════════════════════════════════════
        'ICR': [
            {
                target: '#icr-dashboard-title',
                title: '👋 Welcome to Your Workspace',
                content: 'This is where the actual knowledge transfer happens. Your tools here are supercharged with AI to help you write faster and learn better.',
                disableBeacon: true,
                placement: 'bottom',
            },
            {
                target: '#icr-stats-grid',
                title: '📊 Your Performance Metrics',
                content: 'Track your workload at a glance: see how many projects are in Active Drafting vs the high-intensity Transition phase where you act as a Receiver.',
                placement: 'bottom',
            },
            {
                target: '#icr-nav-my-handovers',
                title: '📤 Writing & Sharing (Handovers)',
                content: 'Click "My Handovers" to access projects where you are a Contributor. In the editor, you can write markdown, attach files, and use Gemini to generate drafts or polish your content.',
                placement: 'right',
            },
            {
                target: '#icr-nav-my-onboardings',
                title: '📥 Reading & Learning (Onboardings)',
                content: 'Click "My Onboardings" to see knowledge you need to absorb. Here you can review documentation, mark sections as "Understood", and use the AI Concierge for instant answers.',
                placement: 'right',
            },
            {
                target: '#icr-notifications',
                title: '🔔 Collaboration Hub',
                content: 'Check here for alerts. You\'ll be notified when colleagues request clarification on your docs, or when new sections are published for you to read.',
                placement: 'left',
            },
        ],
    }), []);

    const currentSteps = useMemo(() => allSteps[roleKey] || [], [roleKey, allSteps]);

    // ─────────────────────────────────────────────────────────────
    // EVENT HANDLER (v3 API uses onEvent, not callback)
    // ─────────────────────────────────────────────────────────────
    const handleEvent = (data) => {
        const { type, status } = data;
        console.log(`[Tour] onEvent type=${type} status=${status}`);

        const done = status === STATUS.FINISHED || status === STATUS.SKIPPED;
        if (done) {
            console.log('[Tour] Tour ended. Calling completeOnboarding...');
            setRun(false);
            completeOnboarding();
        }
    };

    // ─────────────────────────────────────────────────────────────
    // STYLES
    // ─────────────────────────────────────────────────────────────
    const isDark = theme === 'dark';

    const joyrideStyles = {
        options: {
            arrowColor: isDark ? '#1e293b' : '#ffffff',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            overlayColor: 'rgba(0,0,0,0.65)',
            primaryColor: '#7c3aed',
            textColor: isDark ? '#f1f5f9' : '#334155',
            zIndex: 10000,
            width: 400,
        },
        tooltip: {
            borderRadius: '16px',
            padding: '20px 24px 20px 24px',
            boxShadow: isDark
                ? '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        },
        tooltipContainer: {
            textAlign: 'left',
        },
        tooltipTitle: {
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#7c3aed',
            lineHeight: '1.4',
        },
        tooltipContent: {
            fontSize: '13.5px',
            lineHeight: '1.75',
            color: isDark ? '#cbd5e1' : '#475569',
            padding: '0',
        },
        tooltipFooter: {
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
        },
        tooltipFooterSpacer: {
            flex: '1',
        },
        buttonPrimary: {
            borderRadius: '10px',
            padding: '9px 20px',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
            border: 'none',
            cursor: 'pointer',
        },
        buttonBack: {
            fontSize: '13px',
            fontWeight: '600',
            color: isDark ? '#94a3b8' : '#64748b',
            marginRight: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '9px 12px',
        },
        buttonSkip: {
            fontSize: '12px',
            fontWeight: '600',
            color: isDark ? '#475569' : '#94a3b8',
            textDecoration: 'underline',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
        },
        buttonClose: {
            top: '14px',
            right: '14px',
            color: isDark ? '#64748b' : '#94a3b8',
            width: '22px',
            height: '22px',
        },
        spotlight: {
            borderRadius: '8px',
        },
    };

    if (currentSteps.length === 0) return null;

    return (
        <Joyride
            key={`tour-${manualStartCount}-${roleKey}`}
            steps={currentSteps}
            run={run}
            continuous={true}
            debug={false}
            onEvent={handleEvent}
            options={{
                buttons: ['back', 'primary', 'skip'],
                showProgress: true,
                overlayClickAction: false,
                zIndex: 10000,
            }}
            styles={joyrideStyles}
            locale={{
                last: 'Finish Tour ✓',
                skip: 'Skip Tour',
                next: 'Next →',
                back: '← Back',
                open: 'Open',
                close: 'Close',
            }}
        />
    );
}
