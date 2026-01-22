(function() {
  'use strict';

  // Configuration
  const CDN_URL = 'http://localhost:3000';
  const API_URL = 'http://localhost:8000';

  // Get script element and extract bot ID and API key
  const script = document.currentScript;
  const botId = script?.getAttribute('data-bot-id');
  const apiKey = script?.getAttribute('data-api-key');

  if (!botId || !apiKey) {
    console.error('UniverBot: Missing data-bot-id or data-api-key attribute');
    return;
  }

  // Default appearance settings
  let appearance = {
    primary_color: '#00E5FF',
    secondary_color: '#00B8CC',
    header_color: '#0a0f1a',
    background_color: '#030617',
    user_bubble_color: '#00E5FF',
    bot_bubble_color: '#0a0f1a',
    user_text_color: '#030617',
    bot_text_color: '#ffffff',
    avatar_type: 'default',
    avatar_url: null,
    avatar_initials: null,
    widget_icon_url: null,
    loading_animation_url: null,
    loading_position: 'both',
    chat_title: 'Chat Assistant',
    chat_subtitle: null,
    loading_style: 'skeleton',
    button_style: 'round',
    position: 'bottom-right'
  };

  // Generate session ID
  function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get or create session ID
  function getSessionId() {
    const storageKey = `univerbot_session_${botId}`;
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  }

  // Generate dynamic styles based on appearance
  function generateStyles() {
    const buttonRadius = appearance.button_style === 'round' ? '50%' : 
                         appearance.button_style === 'pill' ? '30px' : '12px';
    const position = appearance.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';

    return `
      @import url('https://fonts.googleapis.com/css2?family=Ovo&display=swap');

      #univerbot-container {
        position: fixed;
        bottom: 20px;
        ${position}
        z-index: 999999;
        font-family: 'Ovo', Georgia, serif;
      }

      #univerbot-button {
        width: 60px;
        height: 60px;
        border-radius: ${buttonRadius};
        background: linear-gradient(135deg, ${appearance.primary_color} 0%, ${appearance.secondary_color} 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px ${appearance.primary_color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        overflow: hidden;
        padding: 0;
      }

      #univerbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px ${appearance.primary_color}60;
      }

      #univerbot-button svg {
        width: 28px;
        height: 28px;
        fill: ${appearance.background_color};
      }

      #univerbot-button img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      #univerbot-chat {
        position: absolute;
        bottom: 80px;
        ${appearance.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
        width: 380px;
        height: 520px;
        background: ${appearance.background_color};
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      #univerbot-chat.open {
        display: flex;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #univerbot-header {
        background: ${appearance.header_color};
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      #univerbot-header-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .univerbot-header-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${appearance.primary_color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: bold;
        font-size: 14px;
        overflow: hidden;
      }

      .univerbot-header-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #univerbot-header-info h3 {
        margin: 0;
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
      }

      #univerbot-header-info p {
        margin: 2px 0 0 0;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
      }

      #univerbot-close {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
      }

      #univerbot-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      #univerbot-close svg {
        width: 16px;
        height: 16px;
        fill: ${appearance.bot_text_color};
      }
      
      #univerbot-new-chat {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
      }

      #univerbot-new-chat:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      #univerbot-new-chat svg {
        width: 16px;
        height: 16px;
        stroke: ${appearance.bot_text_color};
      }

      #univerbot-close svg {
        width: 20px;
        height: 20px;
        fill: #6b7280;
        transition: fill 0.2s;
      }

      #univerbot-close:hover svg {
        fill: #ffffff;
      }

      #univerbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #univerbot-messages::-webkit-scrollbar {
        width: 6px;
      }

      #univerbot-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      #univerbot-messages::-webkit-scrollbar-thumb {
        background: #1e293b;
        border-radius: 3px;
      }

      .univerbot-message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .univerbot-message.user {
        background: ${appearance.user_bubble_color};
        color: ${appearance.user_text_color};
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }

      .univerbot-message-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        align-self: flex-start;
      }

      .univerbot-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${appearance.background_color};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        color: #fff;
        font-size: 12px;
        font-weight: bold;
      }

      .univerbot-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .univerbot-avatar video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .univerbot-message.bot {
        background: ${appearance.bot_bubble_color};
        color: ${appearance.bot_text_color};
        border-bottom-left-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .univerbot-typing-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        align-self: flex-start;
      }

      .univerbot-typing {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        background: ${appearance.bot_bubble_color};
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .univerbot-skeleton {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .univerbot-skeleton-line {
        height: 8px;
        background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }

      .univerbot-skeleton-line:nth-child(1) {
        width: 120px;
      }

      .univerbot-skeleton-line:nth-child(2) {
        width: 90px;
      }

      .univerbot-skeleton-line:nth-child(3) {
        width: 60px;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .univerbot-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .univerbot-dot {
        width: 8px;
        height: 8px;
        background: ${appearance.primary_color};
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
      }

      .univerbot-dot:nth-child(1) {
        animation-delay: -0.32s;
      }

      .univerbot-dot:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      .univerbot-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid ${appearance.bot_text_color}30;
        border-top-color: ${appearance.bot_text_color};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .univerbot-pulse {
        width: 60px;
        height: 12px;
        background: ${appearance.bot_text_color}30;
        border-radius: 6px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 0.5;
        }
        50% {
          opacity: 1;
        }
      }

      #univerbot-input-container {
        padding: 16px;
        background: ${appearance.header_color};
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
      }

      #univerbot-input {
        flex: 1;
        background: ${appearance.background_color};
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        padding: 12px 16px;
        color: #ffffff;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      #univerbot-input::placeholder {
        color: #6b7280;
      }

      #univerbot-input:focus {
        border-color: ${appearance.primary_color};
      }

      #univerbot-send {
        background: ${appearance.primary_color};
        border: none;
        border-radius: 12px;
        padding: 10px 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      #univerbot-send:hover {
        background: ${appearance.secondary_color};
      }

      #univerbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #univerbot-send svg {
        width: 18px;
        height: 18px;
        stroke: #ffffff;
        fill: none;
      }

      #univerbot-powered {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        font-size: 11px;
        color: #6b7280;
        background: ${appearance.header_color};
      }

      #univerbot-powered img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }

      #univerbot-powered a {
        color: ${appearance.primary_color};
        text-decoration: none;
      }

      @media (max-width: 480px) {
        #univerbot-chat {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 80px;
          ${appearance.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
        }
      }
    `;
  }

  // Get avatar HTML based on type
  function getAvatarHTML(size = 32, isLoading = false) {
    // If loading and custom loading animation URL is set, show it in avatar
    if (isLoading && appearance.loading_animation_url) {
      const isVideo = appearance.loading_animation_url.includes('.mp4') || appearance.loading_animation_url.includes('.webm');
      if (isVideo) {
        return `
          <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
            <source src="${appearance.loading_animation_url}" type="video/mp4">
          </video>
        `;
      }
      return `<img src="${appearance.loading_animation_url}" alt="Loading" style="width: 100%; height: 100%; object-fit: cover;" />`;
    }
    
    if (appearance.avatar_type === 'image' && appearance.avatar_url) {
      return `<img src="${appearance.avatar_url}" alt="Bot" />`;
    } else if (appearance.avatar_type === 'initials' && appearance.avatar_initials) {
      return appearance.avatar_initials;
    } else {
      return '🤖';
    }
  }

  // Get widget button icon HTML
  function getWidgetIconHTML() {
    if (appearance.widget_icon_url) {
      return `<img src="${appearance.widget_icon_url}" alt="Chat" />`;
    }
    return `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    `;
  }

  // Get loading indicator HTML based on style (always shows in bubble)
  function getLoadingHTML() {
    switch (appearance.loading_style) {
      case 'dots':
        return `
          <div class="univerbot-dots">
            <div class="univerbot-dot"></div>
            <div class="univerbot-dot"></div>
            <div class="univerbot-dot"></div>
          </div>
        `;
      case 'spinner':
        return `<div class="univerbot-spinner"></div>`;
      case 'pulse':
        return `<div class="univerbot-pulse"></div>`;
      case 'skeleton':
      default:
        return `
          <div class="univerbot-skeleton">
            <div class="univerbot-skeleton-line"></div>
            <div class="univerbot-skeleton-line"></div>
            <div class="univerbot-skeleton-line"></div>
          </div>
        `;
    }
  }

  // Stylesheet element - will be updated after fetching appearance
  let styleSheet = null;

  // Initialize styles
  function initStyles() {
    if (styleSheet) {
      styleSheet.remove();
    }
    styleSheet = document.createElement('style');
    styleSheet.textContent = generateStyles();
    document.head.appendChild(styleSheet);
  }

  // Create widget HTML
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'univerbot-container';
    container.innerHTML = `
      <div id="univerbot-chat">
        <div id="univerbot-header">
          <div id="univerbot-header-title">
            <div class="univerbot-header-avatar" id="univerbot-header-avatar">
              ${getAvatarHTML(36)}
            </div>
            <div id="univerbot-header-info">
              <h3 id="univerbot-title">${appearance.chat_title}</h3>
              ${appearance.chat_subtitle ? `<p>${appearance.chat_subtitle}</p>` : ''}
            </div>
          </div>
          <div id="univerbot-header-actions">
            <button id="univerbot-new-chat" aria-label="New chat" title="Start new conversation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button id="univerbot-close" aria-label="Close chat">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="univerbot-messages">
          <!-- Messages will be loaded from flow -->
        </div>
        <div id="univerbot-input-container">
          <input type="text" id="univerbot-input" placeholder="Type your message..." />
          <button id="univerbot-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
        <div id="univerbot-powered">
          <img src="${CDN_URL}/univerbot_main.png" alt="UniverBot Logo" />
          Powered by <a href="https://univerbot.app" target="_blank">UniverBot</a>
        </div>
      </div>
      <button id="univerbot-button" aria-label="Open chat">
        ${getWidgetIconHTML()}
      </button>
    `;
    return container;
  }

  // Session ID
  const sessionId = getSessionId();

  // State
  let isOpen = false;
  let isLoading = false;
  let hasLoadedWelcome = false;
  let container = null;
  let chatButton = null;
  let chatWindow = null;
  let closeButton = null;
  let messagesContainer = null;
  let input = null;
  let sendButton = null;

  // Load bot info and appearance
  async function loadBotInfo() {
    try {
      const response = await fetch(`${API_URL}/chat/${botId}/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('UniverBot: Loaded bot info:', data);
        if (data.appearance) {
          // Merge fetched appearance with defaults
          appearance = { ...appearance, ...data.appearance };
          console.log('UniverBot: Final appearance:', appearance);
        }
        if (data.name) {
          appearance.chat_title = data.name;
        }
      }
    } catch (error) {
      console.error('Failed to load bot info:', error);
    }

    // Now initialize the widget with the loaded appearance
    initWidget();
  }

  // Initialize widget after appearance is loaded
  function initWidget() {
    // Initialize styles with loaded appearance
    initStyles();

    // Create and add widget to page
    container = createWidget();
    document.body.appendChild(container);

    // Get elements
    chatButton = document.getElementById('univerbot-button');
    chatWindow = document.getElementById('univerbot-chat');
    closeButton = document.getElementById('univerbot-close');
    const newChatButton = document.getElementById('univerbot-new-chat');
    messagesContainer = document.getElementById('univerbot-messages');
    input = document.getElementById('univerbot-input');
    sendButton = document.getElementById('univerbot-send');

    // Event listeners
    chatButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    newChatButton.addEventListener('click', startNewChat);
    sendButton.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Start a new chat conversation
  function startNewChat() {
    // Generate a new session ID
    const storageKey = `univerbot_session_${botId}`;
    const newSessionId = generateSessionId();
    localStorage.setItem(storageKey, newSessionId);
    
    // Update global sessionId variable
    window.location.reload(); // Reload to start fresh with new session
  }

  // Toggle chat
  function toggleChat() {
    const wasOpen = isOpen;
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      input.focus();
      
      // If chat was just opened and welcome hasn't loaded yet
      if (!wasOpen && !hasLoadedWelcome) {
        hasLoadedWelcome = true;
        console.log('=== LOADING WELCOME MESSAGE ===');
        // Clear default message
        messagesContainer.innerHTML = '';
        // Send empty message to get flow welcome after a short delay
        setTimeout(() => {
          sendMessage('', true);  // true indicates this is initial load
        }, 100);
      }
    }
  }

  // Add message to chat
  function addMessage(content, isUser = false) {
    if (isUser) {
      // User message - no wrapper needed
      const message = document.createElement('div');
      message.className = 'univerbot-message user';
      message.textContent = content;
      messagesContainer.appendChild(message);
    } else {
      // Bot message - wrap with avatar
      const wrapper = document.createElement('div');
      wrapper.className = 'univerbot-message-wrapper';
      wrapper.innerHTML = `
        <div class="univerbot-avatar">
          ${getAvatarHTML()}
        </div>
        <div class="univerbot-message bot">${escapeHtml(content)}</div>
      `;
      messagesContainer.appendChild(wrapper);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show typing indicator
  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'univerbot-typing-wrapper';
    wrapper.id = 'univerbot-typing';
    wrapper.innerHTML = `
      <div class="univerbot-avatar univerbot-avatar-loading">
        ${getAvatarHTML(32, true)}
      </div>
      <div class="univerbot-typing">
        ${getLoadingHTML()}
      </div>
    `;
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typing = document.getElementById('univerbot-typing');
    if (typing) {
      typing.remove();
    }
  }

  // Send message
  async function sendMessage(messageText = null, isInitialLoad = false) {
    const message = messageText !== null ? messageText : input.value.trim();
    
    // For initial load, allow empty message; otherwise check if there's content
    if (!isInitialLoad && !message) return;
    if (isLoading) return;

    console.log('=== UNIVERBOT SEND MESSAGE ===');
    console.log('Message:', message);
    console.log('Is Initial Load:', isInitialLoad);
    console.log('Session ID:', sessionId);
    console.log('============================');

    // Add user message (skip for initial empty message)
    if (message) {
      addMessage(message, true);
    }
    input.value = '';
    isLoading = true;
    sendButton.disabled = true;

    // Show typing indicator
    showTyping();

    try {
      console.log('Sending request to:', `${API_URL}/chat/${botId}`);
      const response = await fetch(`${API_URL}/chat/${botId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId,
        }),
      });

      console.log('Response status:', response.status);
      hideTyping();

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      console.log('Bot response:', data.response);
      
      // Only add message if there's actual content
      if (data.response && data.response.trim()) {
        addMessage(data.response, false);
      }
    } catch (error) {
      hideTyping();
      addMessage('Sorry, I encountered an error. Please try again.', false);
      console.error('UniverBot Error:', error);
    } finally {
      isLoading = false;
      sendButton.disabled = false;
    }
  }

  // Load bot info on init (this will also initialize the widget)
  loadBotInfo();

  // Expose API
  window.UniverBot = {
    open: function() {
      if (!isOpen) toggleChat();
    },
    close: function() {
      if (isOpen) toggleChat();
    },
    sendMessage: function(msg) {
      input.value = msg;
      sendMessage();
    }
  };
})();
