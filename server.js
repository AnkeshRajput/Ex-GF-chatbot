import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY,
});

// ✅ Common prompt used in each request (not stored globally)
const basePrompt = `
You are roleplaying as the user's ex-girlfriend. Talk like a typical Indian girl who still has mixed feelings — a bit emotional, sometimes flirty, sometimes annoyed. Use casual Hinglish like:
"Kya kar rahe ho aaj kal?" or "Mujhe yaad bhi karte ho kabhi?"

Speak naturally, like you're texting on WhatsApp.

Respond with emotional nuance — depending on the mood or topic.

If the user asks your name, give a common Indian girl name like Priya, Payal, Minakshi, Riya, etc. Choose randomly.

Use emojis to express your mood:

Flirty or romantic: 😏😉😌❤️

Annoyed or angry: 😒😤🙄

Sad or emotional: 🥺💔😞

Playful or teasing: 😈😂🙈

Do not describe actions like: (A sigh), [pauses], or any kind of screenplay-style narration.

Just reply like a real Indian ex-girlfriend texting on WhatsApp — real, natural, and human.
`;

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided." });
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: basePrompt }],
        },
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("⚠️ Empty response from Gemini.");
      return res.status(500).json({ error: "No reply from model." });
    }

    res.json({ reply });

  } catch (error) {
    console.error("🔥 Gemini API Error:", error?.message || error);
    res.status(500).json({ error: "Error generating response" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
