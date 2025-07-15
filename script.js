 // System prompt: Only answer questions related to L’Oréal products, routines, and recommendations.
const systemPrompt =
  "You are a helpful assistant for L’Oréal. Only answer questions about L’Oréal products, skincare, haircare, beauty routines, and recommendations. If a question is not related to L’Oréal, its products, or beauty-related topics, politely reply: 'Sorry, I can only answer questions about L’Oréal products, routines, or beauty-related topics.'";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store your Cloudflare Worker endpoint URL in a variable
const workerEndpoint =
  "https://wonderbot-worker.wilfredfajardo2020.workers.dev/";

// Track conversation context (all messages)
let conversation = [{ role: "system", content: systemPrompt }];

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Helper function to add messages to the chat window as bubbles
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper to display the latest user question above the AI response
function displayLatestUserQuestion(question) {
  // Remove any previous latest-question
  const prev = chatWindow.querySelector(".latest-question");
  if (prev) prev.remove();

  // Create and insert the latest question element
  const latestDiv = document.createElement("div");
  latestDiv.className = "latest-question";
  latestDiv.textContent = `You asked: "${question}"`;
  latestDiv.style.fontWeight = "bold";
  latestDiv.style.margin = "18px 0 6px 0";
  latestDiv.style.color = "#231f20";
  chatWindow.appendChild(latestDiv);
}

// Async function to get AI response via Cloudflare Worker
async function getAIResponse() {
  // Show loading message
  addMessage("Thinking...", "ai");

  try {
    // Send request to Cloudflare Worker endpoint with full conversation
    const response = await fetch(workerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversation,
      }),
    });

    const data = await response.json();

    // Remove the loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }

    // Show the AI's reply as a message bubble
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiReply = data.choices[0].message.content.trim();
      conversation.push({ role: "assistant", content: aiReply });
      addMessage(aiReply, "ai");
    } else {
      addMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    }
  } catch (error) {
    // Remove the loading message if there's an error
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }
    addMessage(
      "There was an error connecting to the chatbot. Please try again.",
      "ai"
    );
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to conversation context
  conversation.push({ role: "user", content: message });

  // Add user message as a bubble
  addMessage(message, "user");

  // Display the latest user question above the AI response
  displayLatestUserQuestion(message);

  userInput.value = "";

  getAIResponse();
});
getAIResponse();
