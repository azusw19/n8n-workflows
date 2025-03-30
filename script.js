const ChatWidget = (() => {
    // --- DOM Elements ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatWidgetContainer = document.getElementById('chat-widget-container');
    const closeChatButton = document.getElementById('close-chat');
    const startChatButton = document.getElementById('start-chat-button');
    const initialView = document.getElementById('chat-initial-view');
    const conversationView = document.getElementById('chat-conversation-view');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const closeConversationButton = document.getElementById('close-conversation');
    const backToInitialButton = document.getElementById('back-to-initial');

    const n8nWebhookUrl = 'https://pruna.app.n8n.cloud/webhook-test/freespirit';
    let chatId = null;

    // --- Initialization ---
    const init = () => {
      // Get or generate Chat ID
      chatId = localStorage.getItem('chatbot_chat_id');
      if (!chatId) {
        chatId = generateUUID();
        localStorage.setItem('chatbot_chat_id', chatId);
      }
      console.log('Chat ID:', chatId);

      // Attach event listeners
      chatBubble.addEventListener('click', toggleChatWidget);
      closeChatButton.addEventListener('click', toggleChatWidget);
      startChatButton.addEventListener('click', showConversationView);
      sendButton.addEventListener('click', handleSendMessage);
      chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleSendMessage();
        }
      });
      closeConversationButton.addEventListener('click', toggleChatWidget);
      backToInitialButton.addEventListener('click', showInitialViewFromConversation);

      // Global keyboard shortcut for Escape key to close the widget.
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && chatWidgetContainer.classList.contains('is-open')) {
          toggleChatWidget();
          chatBubble.focus();
        }
      });

      // Set initial state.
      chatWidgetContainer.classList.add('hidden');
      chatWidgetContainer.classList.remove('is-open');
      chatWidgetContainer.setAttribute('aria-hidden', 'true');
      initialView.classList.remove('hidden');
      conversationView.classList.add('hidden');

      setupThemeToggle();
      testWebhook();
    };

    // --- Core Functions ---
    function toggleChatWidget() {
      const isOpen = chatWidgetContainer.classList.toggle('is-open');
      // Update aria-hidden dynamically for accessibility.
      chatWidgetContainer.setAttribute('aria-hidden', (!isOpen).toString());

      if (isOpen) {
        chatWidgetContainer.classList.remove('hidden');
        // Reset views when opening.
        initialView.classList.remove('hidden', 'leaving');
        conversationView.classList.add('hidden');
        conversationView.classList.remove('entering');
        // Optionally, move focus to the first interactive element.
        startChatButton.focus();
      } else {
        // Allow fade-out transition to complete.
        setTimeout(() => {
          if (!chatWidgetContainer.classList.contains('is-open')) {
            chatWidgetContainer.classList.add('hidden');
          }
        }, 400); // Should match CSS transition duration.
      }
    }

    function showConversationView() {
      // Calculate button center relative to widget container.
      const buttonRect = startChatButton.getBoundingClientRect();
      const widgetRect = chatWidgetContainer.getBoundingClientRect();
      const originX = buttonRect.left + buttonRect.width / 2 - widgetRect.left;
      const originY = buttonRect.top + buttonRect.height / 2 - widgetRect.top;

      // Set transform origin for the conversation view.
      conversationView.style.transformOrigin = `${originX}px ${originY}px`;

      // Start the transition: exit initial view and enter conversation view.
      initialView.classList.add('leaving');
      conversationView.classList.remove('hidden');
      conversationView.classList.add('entering');

      // Add welcome messages immediately
      const existingMessages = Array.from(chatMessages.children).filter(
        (el) => el.id !== 'typing-indicator'
      );
      if (existingMessages.length === 0) {
        displayMessage("Hey there, I'm FreeSpirit bot.", 'bot');
        displayMessage("How can I help you today? 😊", 'bot');
      }
      chatInput.focus();
      // Remove transitionend listener
    }

    function showInitialViewFromConversation() {
      // Start exit animation for conversation view and return to initial view.
      conversationView.classList.remove('entering');
      conversationView.classList.add('leaving');
      initialView.classList.remove('hidden');

      setTimeout(() => {
        conversationView.classList.add('hidden');
        initialView.classList.remove('leaving');
      }, 300); // Matches CSS transition duration.
    }

    function handleSendMessage() {
      const messageText = chatInput.value.trim();
      if (!messageText) return; // Do not send empty messages.

      displayMessage(messageText, 'user'); // Use updated displayMessage
      chatInput.value = '';
      showTypingIndicator();
      sendToWebhook(messageText);
    }

    // *** UPDATED displayMessage function ***
    function displayMessage(text, sender, timestamp) {
      const messageElement = document.createElement('div');
      // Use sender for class (e.g., 'user-message', 'bot-message')
      messageElement.classList.add('message', `${sender}-message`);

      // Main text container
      const messageContent = document.createElement('div');
      messageContent.classList.add('message-content');
      messageContent.innerHTML = marked.parse(text); // Use marked.js for Markdown

      // Footer container (for time + copy button)
      const messageFooter = document.createElement('div');
      messageFooter.classList.add('message-footer');

      // 1. Time Stamp
      // Use the passed-in timestamp if available; otherwise, use the current time.
      const dateObj = timestamp ? new Date(timestamp) : new Date();
      const timeSpan = document.createElement('span');
      timeSpan.classList.add('message-time');
      timeSpan.textContent = formatTime(dateObj); // Use helper function

      // 2. Copy Button
      const copyButton = document.createElement('button');
      copyButton.classList.add('copy-button');
      copyButton.type = 'button';
      // Use innerHTML to set SVG icon AND text
      copyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;
      copyButton.setAttribute('aria-label', 'Copy message text'); // Keep ARIA label
      copyButton.addEventListener('click', () => {
        // Copy the message text to the clipboard.
        navigator.clipboard.writeText(text)
          .then(() => {
              console.log('Message copied to clipboard!');
              // Optional: Provide visual feedback (e.g., change icon or add tooltip)
              // For simplicity, we'll just log for now.
              // You could temporarily change the icon color or add a checkmark icon.
          })
          .catch((err) => console.error('Failed to copy message:', err));
      });

      // Append footer elements
      messageFooter.appendChild(timeSpan);
      messageFooter.appendChild(copyButton);

      // Append main text and footer to the message element
      messageElement.appendChild(messageContent);
      messageElement.appendChild(messageFooter);

      // Finally, append to the chatMessages container and scroll
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    async function sendToWebhook(userMessage) {
      try {
        if (!n8nWebhookUrl.startsWith('http')) {
          throw new Error('Invalid webhook URL');
        }

        const payload = {
          message: userMessage,
          chat_id: chatId,
          timestamp: new Date().toISOString()
        };

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Webhook error response:', errorText);
          throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const botResponse = data.reply || data.output;
        if (botResponse) {
          displayMessage(botResponse, 'bot'); // Use updated displayMessage
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Webhook request failed:', error);
        // Display an error message with a retry option.
        displayErrorMessage("Message failed to send. ", () => sendToWebhook(userMessage));
      } finally {
        hideTypingIndicator();
      }
    }

    function displayErrorMessage(message, retryCallback) {
      const errorElement = document.createElement('div');
      errorElement.classList.add('message', 'error-message'); // Keep error styling if needed
      errorElement.textContent = message;

      const retryButton = document.createElement('button');
      retryButton.textContent = 'Retry';
      retryButton.classList.add('retry-button'); // Add class for styling
      retryButton.addEventListener('click', () => {
        errorElement.remove();
        retryCallback();
      });

      errorElement.appendChild(retryButton);
      chatMessages.appendChild(errorElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- Utility Functions ---
    const generateUUID = () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

    /**
     * Helper function to format a JavaScript Date object as HH:MM (24-hour format).
     */
    function formatTime(dateObj) {
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    function showTypingIndicator() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
        indicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }

    function hideTypingIndicator() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
        indicator.classList.add('hidden');
      }
    }

    async function testWebhook() {
      try {
        const testPayload = {
          test: true,
          chat_id: 'test-' + Date.now()
        };

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });

        const data = await response.json();
        console.log('Webhook test successful:', data);
        return true;
      } catch (error) {
        console.error('Webhook test failed:', error);
        // Do not display message on initial test, only on send failure
        return false;
      }
    }

    function setupThemeToggle() {
      const themeToggle = document.getElementById('theme-toggle');
      themeToggle.addEventListener('click', () => {
        const currentTheme = chatWidgetContainer.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        chatWidgetContainer.setAttribute('data-theme', newTheme);
        localStorage.setItem('chatbot_theme', newTheme);
      });

      const savedTheme = localStorage.getItem('chatbot_theme') || 'light';
      chatWidgetContainer.setAttribute('data-theme', savedTheme);
    }

    // Public API.
    return { init };
  })();

  // Initialize the chat widget when the DOM is fully loaded.
  document.addEventListener('DOMContentLoaded', ChatWidget.init);
