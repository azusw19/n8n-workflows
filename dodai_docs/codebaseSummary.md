# Codebase Summary: n8n Chatbot Widget

## Overview
This document provides a high-level summary of the n8n chatbot widget project structure and key components.

## Current Structure
- `n8n-chatbot-widget/`
  - `index.html`: Contains the HTML structure for the chat bubble, widget container, header, initial view, and conversation view. Includes placeholders for icons. Links to `style.css` and `script.js`.
  - `style.css`: Includes basic resets and initial styling for all components (bubble, container, header, initial view elements, conversation view elements, messages). Uses CSS variables for colors and implements basic layout and visibility toggling (`.hidden`, `.is-open`). Includes transitions for opening/closing.
  - `script.js`: Contains the core JavaScript logic.
    - Initializes on `DOMContentLoaded`.
    - Gets/generates and stores `chat_id` in `localStorage`.
    - Adds event listeners for bubble, close button, start chat button, send button, and Enter key in input.
    - Implements `toggleChatWidget` to show/hide the container.
    - Implements `showConversationView` to switch from initial view.
    - Implements `handleSendMessage` to capture input, display user message, and call `sendToWebhook`.
    - Implements `displayMessage` to append messages to the chat window.
    - Implements `sendToWebhook` using `fetch` to POST to the n8n URL and display the bot's reply.
    - Includes basic error handling for the fetch request.
    - Includes a basic `generateUUID` utility.
  - `dodai_docs/`
    - `projectRoadmap.md`: High-level goals and features.
    - `techStack.md`: Technology choices.
    - `currentTask.md`: Current development focus.
    - `codebaseSummary.md`: This file.

## Key Components (Planned)
- **Chat Bubble:** Fixed-position button to toggle the chat widget.
- **Chat Widget Container:** Main container holding all chat elements.
  - **Header:** Top section with icon/title and close button.
  - **Initial View:** The welcome screen shown when the widget opens. Includes title, intro block, action buttons/links.
  - **Conversation View:** The main chat interface with message display and input area.
- **Message Display:** Area where user and bot messages are rendered.
- **Input Area:** Contains the text input and send button.

## Data Flow
- User input captured via the input field.
- JavaScript sends input + `chat_id` to the n8n webhook via `fetch`.
- JavaScript receives JSON response from the webhook.
- Bot reply is displayed in the message area.
- `chat_id` is persisted in `localStorage`.

## External Dependencies
- None planned (using vanilla HTML, CSS, JS).

## Recent Updates
- Created initial documentation files.
- Implemented basic HTML structure in `index.html`.
- Added initial CSS styling in `style.css` based on the visual reference.
- Implemented core JavaScript logic in `script.js` for widget toggling, view switching, message handling, and webhook communication.
