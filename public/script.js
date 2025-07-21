const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let typingIndicator;

// Load previous chat on startup
window.addEventListener('DOMContentLoaded', loadChatHistory);

form.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  const message = input.value.trim();
  
  if (!message) {
    showInputError();
    return;
  }

  sendUserMessage(message);
  input.value = "";
  
  showTypingIndicator();
  
  try {
    const response = await fetchBotResponse(message);
    handleBotResponse(response);
  } catch (err) {
    handleError();
  }
}

function showInputError() {
  input.placeholder = "Type something... 😠";
  input.classList.add("shake");
  setTimeout(() => input.classList.remove("shake"), 500);
}

function sendUserMessage(message) {
  appendMessage("You", message, "user");
  saveMessage("You", message);
}

async function fetchBotResponse(message) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

function handleBotResponse(data) {
  removeTypingIndicator();
  appendMessage("Ex", data.reply, "bot");
  saveMessage("Ex", data.reply);
}

function handleError() {
  removeTypingIndicator();
  appendMessage("System", "Ugh, my ex is ignoring me again...", "error");
}

function showTypingIndicator() {
  typingIndicator = document.createElement("div");
  typingIndicator.className = "message bot typing";
  typingIndicator.innerHTML = `
    <div class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="label">Typing...</span>
    </div>
  `;
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  if (typingIndicator && chatBox.contains(typingIndicator)) {
    chatBox.removeChild(typingIndicator);
  }
}

function appendMessage(sender, text, className) {
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  msg.innerHTML = `
    <div class="message-header">
      <span class="sender">${sender}</span>
      <span class="timestamp">${time}</span>
    </div>
    <div class="message-text">${text}</div>
  `;
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(sender, text) {
  const chat = JSON.parse(localStorage.getItem('exChat') || '[]');
  chat.push({ sender, text, time: new Date().toISOString() });
  localStorage.setItem('exChat', JSON.stringify(chat));
}

function loadChatHistory() {
  const chat = JSON.parse(localStorage.getItem('exChat') || '[]');
  chat.forEach(msg => {
    const className = msg.sender === 'You' ? 'user' : 'bot';
    appendMessage(msg.sender, msg.text, className);
  });
}