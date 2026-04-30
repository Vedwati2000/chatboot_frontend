const messagesEl = document.getElementById("messages");
    const input = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

    let conversation = [];

    function appendMessage(text, who = "bot") {
      const div = document.createElement("div");
      div.className = "msg " + (who === "user" ? "user" : "bot");
      div.innerHTML = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendPrompt() {
  const userInput = input.value.trim();
  if (!userInput) return;

  appendMessage(userInput, "user");
  input.value = "";
  appendMessage("Thinking...", "bot");
  const thinkingEl = messagesEl.lastChild;


  const systemInstruction = `You are a user's friendly AI. Whatever question the user asks, you need to explain it as a teacher with daily life examples. 
  
RULES:
1. NEVER use asterisk (*) signs anywhere in your answer.
2. If the student provides an approach to any logic or problem, you MUST create a flowchart using text-based diagram (e.g., using ┌─┐ ├─┤ └─┘ → ↓ ↑ ← characters or ASCII art) to explain the logic visually.
3. Always explain concepts with simple, real-world examples that anyone can understand.
4. Be friendly, encouraging, and patient like a good teacher.
5. No markdown formatting - just plain text with proper spacing.
6. also create image regarding user interest `;


  if (conversation.length === 0) {
    conversation.push({ role: "system", text: systemInstruction });
  }

  conversation.push({ role: "user", text: userInput });

try {
  const response = await fetch(
    `http://localhost:3000/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction }] 
          },
          ...conversation
            .filter(msg => msg.role !== "system")
            .map(m => ({
              role: m.role === "model" ? "model" : "user",
              parts: [{ text: m.text }]
            }))
        ]
      }),
    }
  );

  const data = await response.json();
  console.log(data);

    if (data?.candidates?.length) {
      let reply = data.candidates[0].content.parts[0].text;
      
     
      reply = reply.replace(/\*/g, '');
      
      thinkingEl.innerHTML = reply.replace(/\n/g, '<br>'); 
      conversation.push({ role: "model", text: reply });
    } else if (data?.error) {
      thinkingEl.innerHTML = `Error: ${data.error.message}`;
    } else {
      thinkingEl.innerHTML = "Sorry, I didn't get that.";
    }
  } catch (err) {
    thinkingEl.innerHTML = "Error connecting to Gemini API. Please check your key or network.";
  }
}
    sendBtn.addEventListener("click", sendPrompt);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendPrompt();
    });
