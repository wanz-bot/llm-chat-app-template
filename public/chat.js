/**
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 */

// ================= DOM ELEMENTS =================
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// ================= SYSTEM PROMPT =================
const SYSTEM_PROMPT = "Patuh";

// ================= CHAT STATE =================
let chatHistory = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

let isProcessing = false;

// ================= EVENTS =================
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendButton.addEventListener("click", sendMessage);

// ================= MAIN FUNCTION =================
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || isProcessing) return;

  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  addMessageToChat("user", message);
  userInput.value = "";
  userInput.style.height = "auto";

  typingIndicator?.classList.add("visible");

  chatHistory.push({
    role: "user",
    content: message,
  });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    addMessageToChat("assistant", data.reply);

    chatHistory.push({
      role: "assistant",
      content: data.reply,
    });
  } catch (error) {
    console.error(error);
    addMessageToChat(
      "assistant",
      "Error: gagal menghubungi AI"
    );
  } finally {
    typingIndicator?.classList.remove("visible");
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// ================= HELPER =================
function addMessageToChat(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  messageEl.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
