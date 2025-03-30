document.addEventListener('DOMContentLoaded', () => {
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

    const n8nWebhookUrl = 'https://pruna.app.n8n.cloud/webhook-test/freespirit';
    let chatId = null;

    // --- Initialization ---
    function initializeChat() {
        // Get or generate Chat ID
        chatId = localStorage.getItem('chatbot_chat_id');
        if (!chatId) {
            chatId = generateUUID();
            localStorage.setItem('chatbot_chat_id', chatId);
        }
        console.log('Chat ID:', chatId); // For debugging

        // Add event listeners
        chatBubble.addEventListener('click', toggleChatWidget);
        closeChatButton.addEventListener('click', toggleChatWidget);
        startChatButton.addEventListener('click', showConversationView);
        sendButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSendMessage();
            }
        });

        // Ensure initial state is correct (widget closed, initial view shown if widget were open)
        chatWidgetContainer.classList.add('hidden'); // Start hidden explicitly
        chatWidgetContainer.classList.remove('is-open');
        initialView.classList.remove('hidden');
        conversationView.classList.add('hidden');
    }

    // --- Core Functions ---
    function toggleChatWidget() {
        const isOpen = chatWidgetContainer.classList.toggle('is-open');
        // Use opacity/transform transition, manage display with delay
        if (isOpen) {
            chatWidgetContainer.classList.remove('hidden'); // Make it visible for animation
            // Reset to initial view when opening
            initialView.classList.remove('hidden', 'leaving'); // Ensure initial view is ready
            conversationView.classList.add('hidden');
            conversationView.classList.remove('entering'); // Reset conversation view animation state
        } else {
            // Add delay before setting display:none to allow fade-out animation
            // Match CSS transition duration (currently 0.4s in style.css)
            setTimeout(() => {
                if (!chatWidgetContainer.classList.contains('is-open')) { // Double check it wasn't reopened quickly
                   chatWidgetContainer.classList.add('hidden');
                }
            }, 400);
        }
    }

    function showConversationView() {
        // Calculate button center relative to widget container
        const buttonRect = startChatButton.getBoundingClientRect();
        const widgetRect = chatWidgetContainer.getBoundingClientRect();
        
        const originX = buttonRect.left + buttonRect.width/2 - widgetRect.left;
        const originY = buttonRect.top + buttonRect.height/2 - widgetRect.top;

        // Set transform origin to button center
        conversationView.style.transformOrigin = `${originX}px ${originY}px`;

        // Start exit animation for initial view
        initialView.classList.add('leaving');
        
        // Force reflow before starting animation
        void conversationView.offsetWidth;
        
        // Start enter animation for conversation view
        conversationView.classList.remove('hidden');
        conversationView.classList.add('entering');
        
        // Focus input and display greeting after animation completes
        setTimeout(() => {
            // Display auto-greeting only if chat is empty (ignoring typing indicator if present)
            const existingMessages = Array.from(chatMessages.children).filter(el => !el.id || el.id !== 'typing-indicator');
            if (existingMessages.length === 0) {
                 displayMessage("Hey I’m FS bot, how can I help you today? 😊", 'bot');
            }
            chatInput.focus();
        }, 500); // Match CSS transition duration
    }

    function showInitialViewFromConversation() {
        // Start exit animation for conversation view
        conversationView.classList.remove('entering');
        conversationView.classList.add('leaving');

        // Start enter animation for initial view
        initialView.classList.remove('hidden');

        setTimeout(() => {
            conversationView.classList.add('hidden');
            initialView.classList.remove('leaving');
        }, 300);
    }

    // Add event listener for closing the conversation view
    document.getElementById('close-conversation').addEventListener('click', toggleChatWidget);

    // Add event listener for back to initial view
    document.getElementById('back-to-initial').addEventListener('click', showInitialViewFromConversation);

    function handleSendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return; // Don't send empty messages

        displayMessage(messageText, 'user');
        chatInput.value = ''; // Clear input field

        // Show typing indicator
        showTypingIndicator();

        sendToWebhook(messageText);
    }

    function displayMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendToWebhook(userMessage) {
        console.log('Preparing to send message to webhook:', userMessage);
        
        try {
            // Verify webhook URL
            if (!n8nWebhookUrl.startsWith('http')) {
                throw new Error('Invalid webhook URL');
            }

            const payload = {
                message: userMessage,
                chat_id: chatId,
                timestamp: new Date().toISOString()
            };
            console.log('Webhook payload:', payload);

            // Add CORS mode and credentials
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            console.log('Webhook response:', {
                status: response.status,
                statusText: response.statusText,
                headers: [...response.headers]
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Webhook error response:', errorText);
                throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Webhook response data:', data);

            // Handle both 'reply' and 'output' response formats
            const botResponse = data.reply || data.output;
            if (botResponse) {
                displayMessage(botResponse, 'bot');
            } else {
                console.error('Unexpected response format:', data);
                displayMessage("Sorry, I didn't understand the response.", 'bot');
            }

        } catch (error) {
            console.error('Webhook request failed:', error);
            displayMessage("Oops! We're having trouble connecting. Please try again later or contact us at info@freespirittours.eu.", 'bot');
        } finally {
            // Hide typing indicator regardless of success/failure
            hideTypingIndicator();
        }
    }

    // --- Utility Functions ---
    function generateUUID() { // Basic UUID generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Typing Indicator Functions
    function showTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll down
        }
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    // Test webhook connection
    async function testWebhook() {
        try {
            const testPayload = {
                test: true,
                chat_id: 'test-' + Date.now()
            };
            
            console.log('Testing webhook connection...');
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload),
            });

            const data = await response.json();
            console.log('Webhook test successful:', data);
            return true;
        } catch (error) {
            console.error('Webhook test failed:', error);
            displayMessage("Warning: Could not connect to chat service", 'bot');
            return false;
        }
    }

    // Theme Toggle Functionality
    function setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            const widget = document.getElementById('chat-widget-container');
            const currentTheme = widget.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            widget.setAttribute('data-theme', newTheme);
            localStorage.setItem('chatbot_theme', newTheme);
        });

        // Set initial theme
        const savedTheme = localStorage.getItem('chatbot_theme') || 'light';
        document.getElementById('chat-widget-container').setAttribute('data-theme', savedTheme);
    }

    // --- Start the chat ---
    initializeChat();
    testWebhook(); // Run connection test on startup
    setupThemeToggle(); // Initialize theme toggle
});
