# Knowledge Transfer Management System - Current System Specification

This document provides a definitive map of the application's current working condition, logic, and module-specific user flows.

## 1. Authentication & Role-Based Entry
Upon login, the system evaluates the user's role and redirects them via the `DashboardRedirect` component to their designated module.

```mermaid
graph TD
    User((User Login)) --> Auth{Role?}
    Auth -->|System Admin| AdminDB[Admin Dashboard]
    Auth -->|Manager| ManagerDB[Manager Dashboard]
    Auth -->|Functional Role| ICRDB[ICR Dashboard]
```

---

## 2. Admin Module - System Orchestration Flow
The Admin module manages the global infrastructure, user lifecycle, and organizational documentation standards.

```mermaid
graph TD
    A[Admin Dashboard] --> NA[Navigation Bar]
    NA --> UM[User Management]
    UM --> U1[Provison New Account: Name, Role, Admin Status]
    UM --> U2[Monitor User Project Load]
    
    NA --> TM[Template Management]
    TM --> T1[Create Master Section Set]
    T1 --> T2[Define Default Titles & Guidance Text]
    
    NA --> PS[Global Projects Oversight]
    PS --> P1[Monitor Completion % Across Organization]
    PS --> P2[View Specific Project Details]
    P2 --> AdmTrans[Trigger Full or Manager Transition]
    AdmTrans -->|Set Deadline| ModeTransitionAdm[System State: ACTIVE -> TRANSITION]
    
    NA --> SS[System Settings]
    SS --> S1[Configure Multi-Broadcast Notification Rules]
    SS --> S2[Global Theme & UI Customization]
    SS --> S3[First-Login Guided Tour Control]
```

---

## 3. Manager Module - Portfolio Management Flow
The Manager module focuses on launching knowledge transfers, monitoring team velocity, and ensuring quality through AI auditing.

```mermaid
graph TD
    M[Manager Dashboard] --> Stats(Analytics Grid: Active, Transition, My Onboardings, Total)
    M --> PW[Create Project Wizard - 3 Steps]
    PW --> S1[Step 1: Define Metadata & Tech Stack]
    PW --> S2[Step 2: Select Project Team by Functional Role]
    PW --> S3[Step 3: Map Sections to Contributors]
    S3 --> LP((Launch Project))
    
    M --> MC[Your Projects / All Projects View]
    MC --> PDetails[Specific Project Details View]
    PDetails --> AIAudit[Run AI Readiness Audit]
    AIAudit --> Gemini(Gemini 1.5 Analysis: Clarity, Gaps, Risks)
    Gemini --> TransAction{Trigger Individual Transition?}
    TransAction -->|Select Receivers & Set Deadline| ModeTransition[System State: ACTIVE -> TRANSITION]
    
    ModeTransition --> SignOff[Manager Sign-off at 100% Completion]
    SignOff --> RevertActive[System State: Reverts to ACTIVE]
    
    M --> MyH[My Handovers Flow]
    M --> MyO[My Onboardings Flow]
```

---

## 4. ICR Module - Unified Flow (Contributor & Receiver)
The ICR module supports both knowledge capture (handovers) and absorption (onboardings), enabling a seamless transition of information through AI-assisted documentation and interactive learning.

```mermaid
graph TD
    ICR[ICR Dashboard Navigation] --> IC{Project Role?}

    %% Contributor/Handover Branch
    IC -->|Initiator/Contributor| H[My Handovers Dashboard]
    H --> Tabs(Phase Tabs: Active vs Transition)
    Tabs --> HP[Select Project]
    HP --> ED[Handover Section Editor]
    
    ED --> Markdown[Write Documentation in Markdown]
    ED --> AI_Assist{KT-AI Tools}
    AI_Assist -->|Generate| AI_Draft[Gemini creates draft from Section Title]
    AI_Assist -->|Polish| AI_Refine[Gemini enhances tone & clarity]
    
    ED --> Res[Add Resources: File Attachments & Links]
    
    ED --> StatusUpdate{Set Status}
    StatusUpdate -->|Working| DocActive[Status: Active]
    StatusUpdate -->|Completed| DocReview[Status: Ready for Review]
    
    ED <--> Feed(Clarification Hub: Resolve Receiver Questions)
    
    %% Receiver/Onboarding Branch
    IC -->|Receiver| O[My Onboardings Dashboard]
    O --> OP[Select Project]
    OP --> OW[Onboarding Workspace]
    
    OW --> View[Review Published Documentation]
    OW --> AIChat[AI Onboarding Concierge: RAG-enabled Chat]
    OW --> AIQuiz[AI Knowledge Test: Dynamic Comprehensive Quiz]
    
    OW --> Status{Status Update}
    Status -->|Understood| MarkDone[Set Status: Understood]
    Status -->|Confused| MarkNC[Set Status: Needs Clarification]
    
    MarkNC -->|Triggers| Feed
    MarkDone -->|100% Completion Milestone| Grad((Automatic Graduation to Contributor))
```

---

## 5. Technical State & Lifecycle Logic
*   **Continuous Phases**: Projects oscillate between **ACTIVE** (drafting) and **TRANSITION** (reading) modes organically.
*   **Transition Governance & Triggers**:
    *   **Individual Transitions**: Triggered by **Managers** for specific team members. Requires setting a target handover deadline.
    *   **Full / Manager Transitions**: Triggered exclusively by **System Admins** when rotating project ownership or doing a global handover. Requires a target deadline.
*   **Transition Reversion (Sign Off)**: Once a transition phase (Individual, Full, or Manager) reaches 100% completion by Receivers, the Manager signs off on the transition, reverting the system state back to the **ACTIVE** baseline phase.
*   **The Clarification Loop**: Mandatory resolution path for any section flagged with questions by a Receiver.
*   **The Graduation Event**: When a Receiver reaches full comprehension (100% completion in TRANSITION mode), the system automatically promotes their role to **Contributor** for that project.
*   **Real-time Synchronization**: All state changes are broadcast across modules instantly via Supabase channels.
