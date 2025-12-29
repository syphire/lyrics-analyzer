
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lyrics } = req.body;

  if (!lyrics) {
    return res.status(400).json({ error: 'Missing lyrics' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Analiza el contenido emocional de la siguiente letra de canción.
      Devuelve SOLO un objeto JSON VÁLIDO con esta estructura (no añadas markdown, solo el JSON):
      {
        "sentiment": "Una frase corta describiendo la vibra principal (en español)",
        "temas": ["Tema 1", "Tema 2", "Tema 3"],
        "estilo": "Breve análisis (1 fase) sobre el estilo lingüístico (rimas, metáforas, complejidad)",
        "emotions": {
          "Alegría": número (0-100),
          "Tristeza": número (0-100),
          "Energía": número (0-100),
          "Nostalgia": número (0-100),
          "Amor": número (0-100),
          "Esperanza": número (0-100),
          "Soledad": número (0-100)
        }
      }

      Letra:
      ${lyrics.substring(0, 3000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    res.status(200).json(data);
  } catch (error) {
    console.error("ANALYSIS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}
