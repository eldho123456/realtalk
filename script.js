const params = new URLSearchParams(window.location.search);
const scenario = params.get("type");

const chatTitle = document.getElementById("chatTitle");
const chatBox = document.getElementById("chatBox");

let conversation = [];
let step = 0;

// 🎯 Scenario flows
const botFlows = {
  interview: [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why should we hire you?",
    "Describe a challenge you faced.",
    "Where do you see yourself in 5 years?"
  ],
  intro: [
    "Hi! Nice to meet you. Tell me about yourself.",
    "What are your hobbies?",
    "What do you enjoy doing daily?"
  ],
  teacher: [
    "Hi! Ask me any academic or numerical question."
  ],
  conflict: [
    "You didn’t complete your part of the work.",
    "This is affecting the team.",
    "How do you respond to this?"
  ]
};

// 🧠 Initialize
if (chatTitle) {
  if (scenario === "interview") chatTitle.innerText = "Interviewer";
  if (scenario === "intro") chatTitle.innerText = "New Person";
  if (scenario === "teacher") chatTitle.innerText = "Teacher";
  if (scenario === "conflict") chatTitle.innerText = "Colleague";

  addBot(botFlows[scenario][step]);
}

// 💬 Send Message
function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value.trim();
  if (text === "") return;

  addUser(text);
  conversation.push(text);
  input.value = "";

  showTyping();

  setTimeout(() => {
    removeTyping();

    if (scenario === "teacher") {
      addBot(generateTeacherReply(text));
      return;
    }

    let reply = generateSmartReply(text);
    addBot(reply);

    step++;
    if (step < botFlows[scenario].length) {
      setTimeout(() => addBot(botFlows[scenario][step]), 600);
    }

  }, 1000);
}

// 🤖 Smart Replies
function generateSmartReply(text) {
  text = text.toLowerCase();

  if (scenario === "interview") {
    if (text.includes("strength")) return "That’s great. Can you give an example?";
    if (text.includes("hardworking")) return "Good. How do you handle pressure?";
    return "Interesting. Can you elaborate more?";
  }

  if (scenario === "conflict") {
    if (text.includes("sorry")) return "Apologizing is good. How will you fix it?";
    if (text.includes("busy")) return "Communication is important in a team.";
    return "Try to resolve it calmly and professionally.";
  }

  if (scenario === "intro") {
    return "That’s nice! Tell me more about yourself.";
  }

  return "Okay, continue.";
}

// 🧑‍🏫 Teacher Mode
function generateTeacherReply(text) {
  text = text.toLowerCase();

  try {
    if (/^[0-9+\-*/().\s]+$/.test(text)) {
      return "✅ Answer: " + eval(text);
    }
  } catch {}

  if (text.includes("force")) return "Force = mass × acceleration (F = ma).";
  if (text.includes("velocity")) return "Velocity is speed with direction.";
  if (text.includes("atom")) return "An atom is the smallest unit of matter.";
  if (text.includes("area of circle")) return "Area = πr².";

  return "Good question! Try applying the correct formula step by step.";
}

// 💬 UI helpers
function addBot(text) {
  let div = document.createElement("div");
  div.className = "msg bot";
  div.innerText = text;
  chatBox.appendChild(div);
  scrollBottom();

  speak(text); // 🔊 Voice output
}

function addUser(text) {
  let div = document.createElement("div");
  div.className = "msg user";
  div.innerText = text;
  chatBox.appendChild(div);
  scrollBottom();
}

// ⌨️ Typing animation
function showTyping() {
  let div = document.createElement("div");
  div.className = "msg bot typing";
  div.id = "typing";
  div.innerText = "Typing...";
  chatBox.appendChild(div);
  scrollBottom();
}

function removeTyping() {
  let typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// 🔽 Scroll
function scrollBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ⏹️ STOP → Feedback + Score
function endChat() {
  document.getElementById("feedback").innerHTML = analyzeConversation();
}

// 📊 Analysis
function analyzeConversation() {
  let text = conversation.join(" ").toLowerCase();
  let score = 0;
  let result = "<h3>Final Feedback:</h3>";

  if (conversation.length >= 3) {
    score += 2;
    result += "✅ Good participation<br>";
  } else {
    result += "❌ Low interaction<br>";
  }

  if (!text.includes("bro") && !text.includes("dude")) {
    score += 2;
    result += "✅ Professional tone<br>";
  } else {
    result += "❌ Too informal<br>";
  }

  if (text.includes("please") || text.includes("could")) {
    score += 2;
    result += "✅ Polite communication<br>";
  } else {
    result += "⚠️ Add polite words<br>";
  }

  if (!text.includes("maybe")) {
    score += 2;
    result += "✅ Confident responses<br>";
  } else {
    result += "⚠️ Be more confident<br>";
  }

  score += 2;

  result += `<br><h2>Score: ${score}/10</h2>`;
  result += "<b>Tip:</b> Keep practicing real-life conversations.";

  return result;
}

// 🎤 Voice Input
function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onstart = () => {
    addBot("🎤 Listening...");
  };

  recognition.onresult = (event) => {
    let speech = event.results[0][0].transcript;
    document.getElementById("userInput").value = speech;
    sendMessage();
  };

  recognition.onerror = () => {
    addBot("⚠️ Couldn't hear properly.");
  };
}

// 🔊 Voice Output
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

// ⌨️ Enter key
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userInput");
  if (input) {
    input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") sendMessage();
    });
  }
});

function goToChat(type) {
  window.location.href = "chat.html?type=" + type;
}