/**
 * Main Application Logic
 * Coordinates UI events, chat message rendering, Gemini service calls, and storage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatContainer = document.getElementById('chatContainer');
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  
  // Header & Modal Controls
  const apiKeyModalBtn = document.getElementById('apiKeyModalBtn');
  const apiKeyDialog = document.getElementById('apiKeyDialog');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const testKeyBtn = document.getElementById('testKeyBtn');
  const clearSavedKeyBtn = document.getElementById('clearSavedKeyBtn');
  const apiTestFeedback = document.getElementById('apiTestFeedback');
  const keyStatusText = document.getElementById('keyStatusText');
  const keyStatusIndicator = document.getElementById('keyStatusIndicator');
  
  // Theme & Toolbar Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const modelSelect = document.getElementById('modelSelect');
  const currentModelBadge = document.getElementById('currentModelBadge');
  const modePills = document.querySelectorAll('.mode-pill');
  const promptChips = document.querySelectorAll('.chip');

  // Application State
  let conversationHistory = []; // [{ role: 'user' | 'model', text: string }]
  let currentMode = 'normal';   // 'normal' | 'concise' | 'json'
  let isGenerating = false;

  // Configure marked.js for secure and clean rendering
  if (window.marked) {
    window.marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  // =========================================================================
  // Initialization
  // =========================================================================
  function initApp() {
    loadTheme();
    loadModel();
    updateApiKeyStatus();
    renderWelcomeGreeting();
    attachEventListeners();
    setupTextareaAutoresize();
  }

  // Load Saved Theme
  function loadTheme() {
    const savedTheme = StorageService.getTheme();
    document.body.className = savedTheme;
    themeIcon.textContent = savedTheme === 'dark-theme' ? '🌙' : '☀️';
  }

  // Load Saved Model
  function loadModel() {
    const savedModel = StorageService.getModel();
    if (modelSelect) {
      modelSelect.value = savedModel;
    }
    if (currentModelBadge) {
      currentModelBadge.textContent = `Model: ${savedModel}`;
    }
  }

  // Update API Key Status Display in Header
  function updateApiKeyStatus() {
    const hasKey = StorageService.hasApiKey();
    if (hasKey) {
      keyStatusText.textContent = 'API Key: Connected';
      keyStatusIndicator.className = 'badge-status connected';
      apiKeyModalBtn.title = 'Gemini API Key is active (click to modify)';
    } else {
      keyStatusText.textContent = 'API Key: Not Set';
      keyStatusIndicator.className = 'badge-status disconnected';
      apiKeyModalBtn.title = 'Click to configure your Gemini API Key';
    }
  }

  // Initial Personalized Greeting for Anushka
  function renderWelcomeGreeting() {
    chatContainer.innerHTML = '';
    
    const initialGreeting = `Hi, Anushka! 👋 How can I help you today?\n\nI'm your personal AI tutor. You can ask me about:\n- **Programming & Web Dev** (Python, JS, C++, HTML/CSS, React)\n- **Data Structures & Algorithms** (Binary Search, Trees, Dynamic Programming)\n- **AI & ML Concepts**\n- Or test **⚡ 1-word answers** and **📊 JSON format** mode!`;

    appendMessage('tutor', initialGreeting, false, 'Tutor');
  }

  // =========================================================================
  // Chat Rendering Helpers
  // =========================================================================
  
  /**
   * Appends a message bubble to the chat container
   * @param {'user' | 'tutor'} role 
   * @param {string} text 
   * @param {boolean} isJson 
   * @param {string} senderLabel 
   */
  function appendMessage(role, text, isJson = false, senderLabel = '') {
    const messageRow = document.createElement('div');
    messageRow.className = `message-row ${role}`;

    const avatarIcon = role === 'user' ? '👩‍💻' : '🎓';
    const label = senderLabel || (role === 'user' ? 'Anushka' : 'AI Tutor');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messageContentHtml = '';

    if (isJson) {
      // Formatted JSON presentation
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        messageContentHtml = `
          <div class="json-badge">JSON Format</div>
          <pre><div class="code-header"><span>application/json</span><button class="copy-code-btn" onclick="copyCode(this)">Copy JSON</button></div><code class="language-json">${escapeHtml(formatted)}</code></pre>
        `;
      } catch (e) {
        messageContentHtml = `<pre><code>${escapeHtml(text)}</code></pre>`;
      }
    } else if (role === 'user') {
      // Plain text for user message to prevent injection
      messageContentHtml = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
    } else {
      // Markdown rendering for tutor
      if (window.marked) {
        messageContentHtml = window.marked.parse(text);
      } else {
        messageContentHtml = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
      }
    }

    messageRow.innerHTML = `
      <div class="message-avatar">${avatarIcon}</div>
      <div class="message-content-wrapper">
        <div class="message-header">
          <span class="sender-name">${label}</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-bubble">${messageContentHtml}</div>
      </div>
    `;

    chatContainer.appendChild(messageRow);

    // Apply syntax highlighting to code blocks inside the message
    messageRow.querySelectorAll('pre code').forEach((block) => {
      if (window.hljs) {
        window.hljs.highlightElement(block);
      }
      
      // Add copy button if not already present
      const pre = block.parentElement;
      if (!pre.querySelector('.code-header')) {
        const lang = block.className.match(/language-(\w+)/)?.[1] || 'code';
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `<span>${lang}</span><button class="copy-code-btn" onclick="copyCode(this)">Copy</button>`;
        pre.insertBefore(header, block);
      }
    });

    scrollToBottom();
  }

  /**
   * Appends typing animation placeholder
   * @returns {HTMLElement}
   */
  function showTypingIndicator() {
    const typingRow = document.createElement('div');
    typingRow.className = 'message-row tutor';
    typingRow.id = 'typingIndicatorRow';
    typingRow.innerHTML = `
      <div class="message-avatar">🎓</div>
      <div class="message-content-wrapper">
        <div class="message-header">
          <span class="sender-name">AI Tutor</span>
        </div>
        <div class="message-bubble">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `;
    chatContainer.appendChild(typingRow);
    scrollToBottom();
    return typingRow;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicatorRow');
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // Send Message & Interaction Handling
  // =========================================================================

  async function handleSendMessage(customPrompt = null) {
    const text = customPrompt || messageInput.value.trim();
    if (!text || isGenerating) return;

    const apiKey = StorageService.getApiKey();
    if (!apiKey) {
      // Prompt user to enter their key
      openApiKeyModal('Please enter your Gemini API Key to chat with your tutor.');
      return;
    }

    // Append User Message to UI and History
    appendMessage('user', text, false, 'Anushka');
    conversationHistory.push({ role: 'user', text: text });

    // Clear input & reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    isGenerating = true;
    sendBtn.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    const selectedModel = StorageService.getModel();

    try {
      const response = await GeminiService.generateResponse(
        apiKey,
        selectedModel,
        conversationHistory,
        currentMode
      );

      removeTypingIndicator();

      // Sync working model if auto-selected/switched
      if (response.usedModel) {
        StorageService.setModel(response.usedModel);
        loadModel();
      }

      // Append Tutor's response
      appendMessage('tutor', response.text, response.isJson, 'AI Tutor');
      conversationHistory.push({ role: 'model', text: response.text });

    } catch (err) {
      removeTypingIndicator();
      
      const errorMsg = `⚠️ **Error**: ${err.message}`;
      appendMessage('tutor', errorMsg, false, 'System Alert');

      // If invalid key, open modal for convenience
      if (err.message.includes('API Key') || err.message.includes('403') || err.message.includes('401')) {
        setTimeout(() => {
          openApiKeyModal('Your API key seems invalid. Please check and re-enter.');
        }, 1200);
      }
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      messageInput.focus();
    }
  }

  // Auto-resize textarea as user types
  function setupTextareaAutoresize() {
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 140) + 'px';
    });

    // Handle Enter vs Shift+Enter
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  // =========================================================================
  // API Key Modal Dialog Logic
  // =========================================================================

  function openApiKeyModal(alertMessage = null) {
    const currentKey = StorageService.getApiKey();
    apiKeyInput.value = currentKey;
    
    if (alertMessage) {
      showModalAlert(alertMessage, 'error');
    } else {
      hideModalAlert();
    }

    if (typeof apiKeyDialog.showModal === 'function') {
      apiKeyDialog.showModal();
    } else {
      apiKeyDialog.setAttribute('open', 'true');
    }
    apiKeyInput.focus();
  }

  function closeApiKeyModal() {
    if (typeof apiKeyDialog.close === 'function') {
      apiKeyDialog.close();
    } else {
      apiKeyDialog.removeAttribute('open');
    }
    hideModalAlert();
  }

  function showModalAlert(message, type = 'error') {
    apiTestFeedback.textContent = message;
    apiTestFeedback.className = `alert-box ${type}`;
    apiTestFeedback.classList.remove('hidden');
  }

  function hideModalAlert() {
    apiTestFeedback.textContent = '';
    apiTestFeedback.className = 'alert-box hidden';
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================
  function attachEventListeners() {
    // Form Submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });

    // Mode Pills Toggle
    modePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        modePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentMode = pill.getAttribute('data-mode');
      });
    });

    // Suggestion Chips Click
    promptChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          handleSendMessage(prompt);
        }
      });
    });

    // API Key Dialog Open/Close
    apiKeyModalBtn.addEventListener('click', () => openApiKeyModal());
    closeModalBtn.addEventListener('click', () => closeApiKeyModal());

    // Light dismiss dialog on backdrop click
    apiKeyDialog.addEventListener('click', (e) => {
      const rect = apiKeyDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeApiKeyModal();
      }
    });

    // Toggle Key Visibility (Show/Hide password)
    toggleKeyVisibility.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleKeyVisibility.textContent = '🙈';
      } else {
        apiKeyInput.type = 'password';
        toggleKeyVisibility.textContent = '👁️';
      }
    });

    // Save API Key
    saveKeyBtn.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        showModalAlert('Please enter an API key before saving.', 'error');
        return;
      }

      StorageService.setApiKey(key);
      const chosenModel = modelSelect.value;
      StorageService.setModel(chosenModel);
      loadModel();
      updateApiKeyStatus();
      closeApiKeyModal();
    });

    // Test API Key Connection
    testKeyBtn.addEventListener('click', async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        showModalAlert('Please enter a key to test.', 'error');
        return;
      }

      testKeyBtn.disabled = true;
      testKeyBtn.textContent = 'Testing...';
      hideModalAlert();

      const result = await GeminiService.testApiKey(key, modelSelect.value);
      testKeyBtn.disabled = false;
      testKeyBtn.textContent = 'Test Connection';

      if (result.success) {
        showModalAlert(result.message, 'success');
        if (result.availableModels && result.availableModels.length > 0) {
          modelSelect.innerHTML = '';
          result.availableModels.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.id} (${m.name})`;
            if (m.id === result.workingModel) opt.selected = true;
            modelSelect.appendChild(opt);
          });
        }
        if (result.workingModel) {
          modelSelect.value = result.workingModel;
          StorageService.setModel(result.workingModel);
          loadModel();
        }
      } else {
        showModalAlert(result.message, 'error');
      }
    });

    // Clear Saved API Key
    clearSavedKeyBtn.addEventListener('click', () => {
      StorageService.clearApiKey();
      apiKeyInput.value = '';
      updateApiKeyStatus();
      showModalAlert('API key removed from browser storage.', 'success');
    });

    // Model Selector Change
    if (modelSelect) {
      modelSelect.addEventListener('change', () => {
        StorageService.setModel(modelSelect.value);
        loadModel();
      });
    }

    // Theme Toggle (Dark / Light)
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const newTheme = isDark ? 'light-theme' : 'dark-theme';
      document.body.className = newTheme;
      StorageService.setTheme(newTheme);
      themeIcon.textContent = newTheme === 'dark-theme' ? '🌙' : '☀️';
    });

    // Clear Conversation History
    clearChatBtn.addEventListener('click', () => {
      if (conversationHistory.length > 0) {
        if (confirm('Do you want to reset the conversation and start fresh?')) {
          conversationHistory = [];
          renderWelcomeGreeting();
        }
      } else {
        renderWelcomeGreeting();
      }
    });
  }

  // Global helper for code block copy buttons
  window.copyCode = function (button) {
    const pre = button.closest('pre');
    const code = pre.querySelector('code');
    if (!code) return;

    navigator.clipboard.writeText(code.innerText).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied! ✓';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    });
  };

  // Run initial setup
  initApp();
});
