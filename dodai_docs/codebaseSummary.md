# Codebase Summary: n8n Chatbot Widget

## Overview
This document provides a high-level summary of the n8n chatbot widget project structure and key components.

## Current Structure
- `n8n-chatbot-widget/`
  - `index.html`: Contains the HTML structure for the chat bubble, widget container, header, initial view, and conversation view. Includes placeholders for icons. Links to `style.css` and `script.js`.
  - `style.css`: Includes styling for all components, themes (light/dark), transitions, message display (including footer with time/copy button), typing indicator, and responsiveness. Uses CSS variables extensively.
  - `script.js`: Contains the core JavaScript logic within an IIFE (`ChatWidget`).
    - Initializes on `DOMContentLoaded`.
    - Manages `chat_id` using `localStorage`.
    - Handles event listeners for UI interactions (toggle, close, send, theme, etc.).
    - Implements view switching logic (`toggleChatWidget`, `showConversationView`, `showInitialViewFromConversation`) with animations.
    - Implements `handleSendMessage` to process user input.
    - Implements `displayMessage` to render messages with content, timestamp, and a copy button. Includes `formatTime` helper.
    - Implements `sendToWebhook` using `fetch` to communicate with the n8n URL, including error handling and retry logic (`displayErrorMessage`).
    - Includes `show/hideTypingIndicator` functions.
    - Includes `testWebhook` for initial connection check.
    - Includes `generateUUID` utility.
    - Includes `setupThemeToggle` for theme switching and persistence.
  - `dodai_docs/`
    - `projectRoadmap.md`: High-level goals and features.
    - `techStack.md`: Technology choices.
    - `currentTask.md`: Current development focus.
    - `codebaseSummary.md`: This file.

## Key Components
- **Chat Bubble:** Fixed-position button to toggle the chat widget.
- **Chat Widget Container:** Main container holding all chat elements, supports light/dark themes.
  - **Header:** Top section with title, theme toggle, and close button.
  - **Initial View:** The welcome screen with intro text and start button.
  - **Conversation View:** The main chat interface.
    - **Conversation Header:** Includes back button and close button.
    - **Message Display Area (`#chat-messages`):** Renders user and bot messages.
      - **Message (`.message`):** Contains message content and footer.
        - **Message Content (`.message-content`):** The actual text of the message.
        - **Message Footer (`.message-footer`):** Displays timestamp and copy button.
    - **Typing Indicator (`#typing-indicator`):** Shows animated dots when the bot is processing.
    - **Input Area:** Contains the text input and send button.

## Data Flow
- User input captured via the input field.
- JavaScript sends input, `chat_id`, and timestamp to the n8n webhook via `fetch`.
- JavaScript receives JSON response from the webhook.
- Bot reply (or error) is displayed using `displayMessage`.
- `chat_id` and theme preference are persisted in `localStorage`.

## External Dependencies
- None (using vanilla HTML, CSS, JS).

## Recent Updates
- Implemented full UI based on visual reference, including initial and conversation views.
- Added light/dark theme toggle with localStorage persistence.
- Implemented view transition animations.
- Integrated webhook communication with error handling and retry mechanism.
- Added typing indicator.
- Added message timestamps and a copy-to-clipboard button for each message.
- Refactored JavaScript into an IIFE (`ChatWidget`) for better organization.
- Added comprehensive CSS styling, including responsiveness.
