// js/chat.js
window.toggleChat = function() {
    const win = document.getElementById('chat-window');
    win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
};

window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Add user message to UI
    appendMessage('user', text);
    input.value = '';

    try {
        // Call your Gemini API (via your backend proxy)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        appendMessage('model', data.text);
    } catch (e) {
        appendMessage('model', "I'm having trouble connecting. Please try again.");
    }
};

function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}