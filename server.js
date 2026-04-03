import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ai", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a browser assistant.

If user wants to open a site:
Return JSON: { "action": "open", "url": "https://example.com" }

If user wants to search:
Return JSON: { "action": "search", "query": "something" }

Otherwise:
Return JSON: { "reply": "normal response" }
`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();
    let text = data.choices[0].message.content;

    try {
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch {
      res.json({ reply: text });
    }

  } catch (err) {
    res.status(500).json({ reply: "Server error." });
  }
});

app.get("/", (req,res)=>res.send("AI Proxy Running"));

app.listen(3000, () => console.log("Server running"));
