import { GoogleGenerativeAI } from "@google/generative-ai";

// Try to get API key from environment (Commonly VITE_GEMINI_API_KEY in Vite projects)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const AIService = {
  /**
   * Helper to clean Gemini JSON responses (sometimes wrapped in tags)
   */
  _extractJson(text, defaultValue = {}) {
    try {
      // Handle potential empty or weird text
      if (!text || typeof text !== 'string') return defaultValue;
      const stripped = text.replace(/```json|```/g, "").trim();
      // Use regex to find potential JSON block if not at start
      const match = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const jsonStr = match ? match[0] : stripped;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("[AIService] JSON extraction failed. Using default.", e);
      return defaultValue;
    }
  },

  /**
   * Generate a documentation draft based on project context
   */
  async generateDraft({ projectName, description, techStack, sectionTitle }) {
    if (!apiKey) return `[AI Error] Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a concise markdown draft for a ${sectionTitle} section of a knowledge transfer document. Include the project name (${projectName}), a brief description, and the tech stack (${techStack.join(", ")}). Keep it professional and technical.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  /**
   * Polish and professionalize existing content
   */
  async polishContent(content) {
    if (!apiKey) return content;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Polish the following documentation text, improving grammar, capitalization, and clarity. Return only the refined markdown without any conversational filler.\n\n${content}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  /**
   * AI Clarity Checker: Evaluates content for ambiguity, incompleteness, and structure.
   */
  async evaluateClarity(content) {
    if (!apiKey) return { score: 50, suggestions: ["Add API Key for analysis."] };
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Evaluate the clarity of the following documentation snippet. Provide a score from 0 to 100 and a short list of 2-3 improvement suggestions. Return ONLY a JSON object with keys 'score' (number) and 'suggestions' (array of strings).\n\n${content}`;
      
      const result = await model.generateContent(prompt);
      return this._extractJson(result.response.text(), { score: 75, suggestions: [] });
    } catch (error) {
      console.error("[AIService] evaluateClarity failed:", error);
      return { score: 70, suggestions: ["Automated clarity audit pending..."] };
    }
  },

  /**
   * AI Quiz Generator: Creates validation checkpoints based on section content.
   */
  async generateQuiz(sectionTitle, content) {
    if (!apiKey) return [{ id: 1, question: "API key missing", options: ["Ok"], answer: 0 }];
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Create two multiple‑choice quiz questions that test understanding of the '${sectionTitle}' section described below. Return a JSON array where each element has 'id', 'question', 'options' (array of strings), and 'answer' (index of correct option).\n\n${content}`;
      
      const result = await model.generateContent(prompt);
      return this._extractJson(result.response.text(), []);
    } catch (error) {
      console.error("[AIService] generateQuiz failed:", error);
      return [];
    }
  },

  /**
   * Context‑Aware Onboarding Concierge logic.
   */
  async getChatResponse({ message, role, mode, projectContext, sectionContext }) {
    if (!apiKey) return { text: "Add your Gemini API key to start chatting!", suggestions: [] };
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const systemInstruction = `You are a role‑aware AI concierge for a knowledge‑transfer project. Respond concisely and suggest next steps when appropriate. Role: ${role}, Project: ${projectContext?.name}.`;
      const userPrompt = `Context: ${JSON.stringify(sectionContext)}\nMessage: ${message}`;
      
      const result = await model.generateContent(`${systemInstruction}\n\n${userPrompt}`);
      return { text: result.response.text(), suggestions: ["Tell me more", "Next section"] };
    } catch (error) {
      console.error("[AIService] getChatResponse failed:", error);
      return { text: "I'm having trouble connecting to my brain right now. Please check your API key.", suggestions: [] };
    }
  },

  /**
   * Tech Stack Extraction: Automatically extracts tools/frameworks from content.
   */
  async extractTechStack(content) {
    if (!apiKey) return [];
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Identify up to eight technology names (frameworks, libraries, platforms, databases, cloud services) mentioned in the following text. For each, determine its category: 'Frontend', 'Backend', 'Database', 'Infrastructure', or 'Other'.
      
      Return ONLY a JSON array of objects where each object has 'name' (string) and 'category' (string).
      
      Content:
      ${content}`;
      
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      return this._extractJson(raw, []);
    } catch (error) {
      console.error("[AIService] extractTechStack failed:", error);
      return [];
    }
  },

  /**
   * Knowledge Gap Detection: Periodic analysis of all project sections.
   */
  async detectKnowledgeGaps(sections = []) {
    try {
      const insights = [];
      
      // Check for empty or draft sections
      const emptySections = sections.filter(s => !s.content || s.status === 'Not Started' || s.status === 'Draft');
      if (emptySections.length > 0) {
        insights.push({
          type: 'completeness',
          priority: 'High',
          title: 'Incomplete Documentation',
          message: `${emptySections.length} sections are either empty or in draft state. Knowledge transfer cannot finalize without content.`,
          affectedSections: emptySections.map(s => s.title || "Untitled")
        });
      }

      const lowScoreSections = sections.filter(s => s.content && (s.clarityScore || 0) < 60);
      if (lowScoreSections.length > 0) {
        insights.push({
          type: 'clarity',
          priority: 'Medium',
          title: 'Low Content Clarity',
          message: `${lowScoreSections.length} sections have been flagged for ambiguity or poor structure by AI audit.`,
          affectedSections: lowScoreSections.map(s => s.title || "Untitled")
        });
      }

      const missingTech = !sections.some(s => (s.title || '').toLowerCase().includes('stack') || (s.title || '').toLowerCase().includes('technology'));
      if (missingTech) {
        insights.push({
          type: 'coverage',
          priority: 'Medium',
          title: 'Missing Infrastructure Context',
          message: 'No "Technology Stack" section detected. This is critical for onboarding receivers.',
          suggestion: 'Add a section detailing the tech stack.'
        });
      }
      return insights;
    } catch (e) {
      console.error("[AIService] detectKnowledgeGaps error:", e);
      return [];
    }
  },

  /**
   * Transition Readiness Scoring: Signals if a project is ready for sign‑off.
   */
  async computeReadinessScore(sections = [], members = []) {
    const totalSections = sections.length || 1;
    
    // Weighted completeness
    // 100% value for Understood, 70% for Ready for Review, 30% for Draft with content
    const weightedCompleteness = sections.reduce((acc, s) => {
      if (!s.content) return acc;
      if (s.status === 'Understood') return acc + 1;
      if (s.status === 'Ready for Review') return acc + 0.7;
      if (s.status === 'Draft') return acc + 0.3;
      return acc + 0.2; // Not Started but has content
    }, 0);

    const avgClarity = sections.reduce((acc, s) => acc + (s.clarityScore || 80), 0) / totalSections;
    
    // Completeness (0-70) + Clarity (0-15) + Team coverage (0-15)
    const completenessBonus = (weightedCompleteness / totalSections) * 70;
    const clarityBonus = (avgClarity / 100) * 15;
    const teamBonus = Math.min((members.length / 2) * 15, 15);
    
    return Math.round(completenessBonus + clarityBonus + teamBonus);
  },

  /**
   * AI‑Assisted Transition Planning recommendations.
   */
  async recommendTransitionPlan(project, score, gaps) {
    const defaultPlan = { focusAreas: [], clarificationsNeeded: [] };
    if (!apiKey) return defaultPlan;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Review project '${project.name}' with readiness score ${score}% and gaps: ${JSON.stringify(gaps)}. Suggest 3 main focus areas for the handover and 2-3 specific clarifications needed from the current team. Return ONLY a JSON object with 'focusAreas' (array of strings) and 'clarificationsNeeded' (array of strings).`;
      
      const result = await model.generateContent(prompt);
      return this._extractJson(result.response.text(), defaultPlan);
    } catch (error) {
      console.error("[AIService] recommendTransitionPlan failed:", error);
      return defaultPlan;
    }
  },

  /**
   * Archival Readiness Audit.
   */
  async runArchivalAudit(project) {
    const issues = project.completion < 100 ? ["Project is not 100% complete."] : [];
    if (project.sections?.some(s => (s.clarityScore || 100) < 60)) {
      issues.push("Some sections have poor clarity scores.");
    }
    return {
      isReady: issues.length === 0,
      report: issues.length === 0 ? "Project meets all archival quality standards." : `Audit found ${issues.length} issues: ${issues.join(' ')}`,
      issues
    };
  }
};
