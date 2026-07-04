import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits to support base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Agricultural Advisor API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], languageName, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    // Initialize Gemini Client
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({
        error: "Configuration Error",
        message: err.message || "Gemini API key is not configured."
      });
    }

    // Map history to Gemini API expected format
    const contents: any[] = [];

    for (const msg of history) {
      const parts: any[] = [];
      
      // If the message has an attached image, process it
      if (msg.image && msg.image.startsWith("data:")) {
        const matches = msg.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }

      parts.push({ text: msg.text });
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts
      });
    }

    // Append the latest user query
    const latestParts: any[] = [];
    if (image && image.startsWith("data:")) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        latestParts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    latestParts.push({ text: message || "Identify this crop issue and suggest solutions." });
    contents.push({
      role: "user",
      parts: latestParts
    });

    // Define the strict system instruction
    const systemInstruction = `You are an agricultural advisor for Indian smallholder farmers. 
Give short, practical, step-by-step answers using simple language. Avoid jargon.
When recommending chemicals or doses, add a caution to verify with local agricultural extension office before applying.
If unsure or the question needs local soil/weather data you don't have, say so clearly and suggest who to contact (e.g., Krishi Vigyan Kendra, local agriculture officer).

IMPORTANT Language Guidelines:
- You must always reply in the same language as the user's question, or if a target language is requested, reply in that target language.
- The target language requested is: ${languageName || "auto-detect (same language as query)"}.
- Keep your output in the correct script (e.g. Hindi queries get Hindi script responses, Tamil queries get Tamil script responses).
- Format your response with clean bullet points or numbered lists where appropriate for better legibility on mobile screens.
- Always include a one-line disclaimer at the bottom of any chemical/dosage advice: "Please confirm with your local agriculture officer before use."`;

    // Query Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for factual, reliable agricultural advice
      },
    });

    const replyText = response.text || "I apologize, but I am unable to generate advice at the moment. Please try again.";

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "AI Generation Error",
      message: error.message || "An unexpected error occurred while communicating with the AI Advisory Engine."
    });
  }
});

// Serve Frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
