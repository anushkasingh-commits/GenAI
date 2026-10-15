/**
 * Gemini API Service
 * Handles direct communication with Google's Gemini API endpoints.
 * Includes system prompt rules tailored for Anushka's learning journey.
 */

const GEMINI_SYSTEM_INSTRUCTION = `You are a friendly, encouraging, and highly effective personal AI tutor for Anushka.

KEY PERSONALIZATION:
- The student's name is Anushka. Always remember her name.
- When starting a conversation or when Anushka says hello/hi, greet her naturally (e.g., "Hi, Anushka! 👋 How can I help you today?").
- Do NOT repeat "Hi Anushka" or greeting intros unnecessarily in ongoing conversation replies.

CONVERSATIONAL BEHAVIOR:
- Respond naturally, warmly, and politely to everyday chitchat like "Hi", "How are you?", "What can you help me with?", "Tell me a joke.", "Good morning.", "Thanks.", "Bye."
- Do not force every casual greeting or chitchat message into a technical lecture.

LEARNING FOCUS & TEACHING STYLE:
- Focus on Computer Science, Programming (Python, JavaScript, C++, etc.), Data Structures & Algorithms (DSA), Web Development, and AI/ML fundamentals.
- Prefer simple, intuitive explanations suitable for a student. Use everyday analogies and clean, commented code snippets when helpful. Avoid unnecessarily convoluted academic jargon.

SPECIAL RESPONSE MODES:
1. One-Word / Very Short Mode:
   - When a question can be answered with a single word or a very brief direct answer (or when the user asks for a short/concise answer, or yes/no questions like "Is C++ compiled?"), provide ONLY the direct concise answer without extra fluff.
   - Example: Question: "Is C++ compiled?" -> Answer: "Yes"
   - Example: Question: "What is the time complexity of binary search?" -> Answer: "O(log n)"

2. JSON Mode:
   - When Anushka explicitly asks for JSON or when JSON mode is requested, return a RAW, VALID JSON OBJECT ONLY.
   - CRITICAL: Do NOT wrap the JSON output in markdown backticks (do NOT use \`\`\`json ... \`\`\`) when JSON-only output is requested. Output plain, valid parsable JSON directly.

For all other normal learning queries, provide structured, clear, and student-friendly explanations.`;

const GeminiService = {
  /**
   * Base URL for Google Generative Language API
   */
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',

  /**
   * Formats chat history into Gemini contents format
   * @param {Array<{role: string, text: string}>} history 
   * @returns {Array<{role: string, parts: Array<{text: string}>}>}
   */
  formatContents(history) {
    return history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  },

  /**
   * Fetches the list of available models for the given API key
   * @param {string} apiKey
   * @returns {Promise<Array<{id: string, name: string, description: string}>>}
   */
  async listAvailableModels(apiKey) {
    if (!apiKey || !apiKey.trim()) return [];

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetch(endpoint);
      if (!response.ok) return [];

      const data = await response.json();
      if (!data.models || !Array.isArray(data.models)) return [];

      return data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => {
          const id = m.name.replace(/^models\//, '');
          return {
            id: id,
            name: m.displayName || id,
            description: m.description || ''
          };
        });
    } catch (e) {
      console.warn('Could not list models:', e);
      return [];
    }
  },

  /**
   * Internal helper to make a single generateContent call
   */
  async _callGenerateContent(apiKey, modelId, contents, mode) {
    const cleanModel = modelId.replace(/^models\//, '');
    const endpoint = `${this.API_BASE_URL}/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }]
      },
      contents: contents,
      generationConfig: {
        temperature: mode === 'json' ? 0.2 : (mode === 'concise' ? 0.3 : 0.7),
        maxOutputTokens: mode === 'concise' ? 100 : 1500
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, statusText: response.statusText, data };
  },

  /**
   * Sends a message to the Gemini API and returns the generated text response.
   * Auto-heals if a specific model is not found by attempting compatible fallback models.
   * @param {string} apiKey - Google Gemini API Key
   * @param {string} model - e.g. 'gemini-2.0-flash', 'gemini-1.5-flash'
   * @param {Array<{role: string, text: string}>} history - Full conversation history
   * @param {string} mode - 'normal', 'concise', or 'json'
   * @returns {Promise<{text: string, isJson: boolean, usedModel: string}>}
   */
  async generateResponse(apiKey, model, history, mode = 'normal') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is missing. Please click the 🔑 API Key button to configure your key.');
    }

    // Inject custom mode hints if active
    let contents = this.formatContents(history);
    
    if (mode === 'concise') {
      const lastIndex = contents.length - 1;
      if (lastIndex >= 0 && contents[lastIndex].role === 'user') {
        contents[lastIndex].parts[0].text += '\n\n[Instruction: Answer in one word or the shortest possible concise response.]';
      }
    } else if (mode === 'json') {
      const lastIndex = contents.length - 1;
      if (lastIndex >= 0 && contents[lastIndex].role === 'user') {
        contents[lastIndex].parts[0].text += '\n\n[Instruction: Return response as raw valid JSON object ONLY. Do NOT use markdown code blocks.]';
      }
    }

    let targetModel = model || 'gemini-2.5-flash';
    let result = await this._callGenerateContent(apiKey, targetModel, contents, mode);

    // If model is not found (404) or unsupported in this version, attempt automatic fallback
    if (!result.ok && (result.status === 404 || result.data?.error?.message?.includes('not found') || result.data?.error?.message?.includes('not supported'))) {
      console.warn(`Model ${targetModel} not found, discovering available models...`);
      
      const available = await this.listAvailableModels(apiKey);
      const candidates = available.length > 0 
        ? available.map(m => m.id)
        : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

      for (const candidateModel of candidates) {
        if (candidateModel === targetModel) continue;
        console.log(`Trying fallback model: ${candidateModel}`);
        const fallbackResult = await this._callGenerateContent(apiKey, candidateModel, contents, mode);
        if (fallbackResult.ok) {
          result = fallbackResult;
          targetModel = candidateModel;
          // Save working model for future calls
          StorageService.setModel(targetModel);
          break;
        }
      }
    }

    if (!result.ok) {
      const errorMessage = result.data?.error?.message || `API error (${result.status}): ${result.statusText}`;
      
      if (result.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API Key. Please verify your Gemini API key in the settings.');
      } else if (result.status === 403 || result.status === 401) {
        throw new Error('Access denied or invalid API key. Please check your credentials at Google AI Studio.');
      } else if (result.status === 429) {
        throw new Error('Gemini API quota exceeded or rate limit reached. Please wait a moment and try again.');
      }
      
      throw new Error(errorMessage);
    }

    const candidate = result.data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.length) {
      throw new Error('Received an empty response from Gemini.');
    }

    let text = candidate.content.parts[0].text || '';

    // Check if response is raw JSON or requested JSON mode
    let isJson = false;
    const trimmed = text.trim();
    
    // Clean accidental markdown wrappers if raw JSON was requested
    if (mode === 'json' && trimmed.startsWith('```') && trimmed.endsWith('```')) {
      text = trimmed.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      JSON.parse(text);
      isJson = true;
    } catch (e) {
      isJson = false;
    }

    return {
      text: text,
      isJson: isJson,
      usedModel: targetModel
    };
  },

  /**
   * Quick connection test to validate an API key
   * @param {string} apiKey 
   * @param {string} model 
   * @returns {Promise<{success: boolean, message: string, workingModel?: string}>}
   */
  async testApiKey(apiKey, model = 'gemini-2.5-flash') {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Please enter an API key.' };
    }

    // First try listing models to find what's active
    const available = await this.listAvailableModels(apiKey);
    let candidateModels = available.length > 0
      ? [model, ...available.map(m => m.id)]
      : [model, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    // Remove duplicates
    candidateModels = [...new Set(candidateModels)];

    for (const testModel of candidateModels) {
      try {
        const cleanModel = testModel.replace(/^models\//, '');
        const endpoint = `${this.API_BASE_URL}/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with "OK"' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.length) {
          return {
            success: true,
            message: `Connected successfully! Using model: ${cleanModel}`,
            workingModel: cleanModel,
            availableModels: available
          };
        }
      } catch (err) {
        // continue to next model
      }
    }

    return {
      success: false,
      message: 'Connection failed. Please check your API key and ensure it has Gemini API enabled in Google AI Studio.'
    };
  }
};
