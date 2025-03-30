# Tech Stack: n8n Chatbot Widget

## Frontend
- **HTML5:** For structuring the chatbot widget content.
- **CSS3:** For styling the widget, including layout (Flexbox/Grid), responsiveness, transitions, and visual appearance based on the provided design (gradients, rounded corners, etc.).
- **Vanilla JavaScript (ES6+):** For handling user interactions (opening/closing chat, sending messages), managing state (chat ID via localStorage), DOM manipulation, and asynchronous communication (`fetch` API) with the n8n webhook.

## Communication
- **Fetch API:** Standard browser API for making HTTP requests to the n8n webhook.
- **JSON:** Data format for sending user messages and receiving bot replies.

## Storage
- **localStorage:** Browser storage for persisting the unique `chat_id` across sessions.

## Design Principles
- **Modern & Minimalistic:** Clean layout, intuitive UI, based on the provided visual reference.
- **Responsive:** Basic adaptation to different screen sizes.
- **Interactive:** Smooth transitions and clear user feedback.
