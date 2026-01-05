import fetch from "node-fetch";
import * as cheerio from "cheerio";

function cleanLyrics(text) {
  return text
    // 1️⃣ Contributors, traducciones, idioma
    .replace(/^\d+\s+Contributors?.*\n?/i, "")
    .replace(/Translations?.*\n?/gi, "")
    .replace(/^(English|Spanish|Español|Portuguese|French).*?\n?/gim, "")

    // 2️⃣ Títulos tipo "Zapatillas Lyrics"
    .replace(/Lyrics?\n?/gi, "")

    // 3️⃣ [Letra de "..."]
    .replace(/\[Letra de.*?\]\n?/gi, "")

    // 4️⃣ Etiquetas musicales [Chorus], [Verse 1], etc.
    .replace(/\[(Verse|Chorus|Intro|Outro|Bridge|Hook|Refrain|Pre-Chorus|Post-Chorus|Estribillo|Pre-Estribillo|Puente|Verso 2|Verso 1).*?\]\n?/gi, "")

    // 5️⃣ Limpieza final
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing song id" });
  }

  try {
    // 1️⃣ Obtener info de la canción por ID
    const songRes = await fetch(`https://api.genius.com/songs/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_API_KEY}`
      }
    });

    if (!songRes.ok) {
      throw new Error("Failed to fetch song info");
    }

    const songData = await songRes.json();
    const song = songData.response.song;

    // 2️⃣ Scrapear letra desde la URL
    console.log("Fetching lyrics from URL:", song.url);
    const html = await fetch(song.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }).then(r => r.text());

    console.log("HTML fetched, length:", html.length);
    const $ = cheerio.load(html);

    const container = $('[data-lyrics-container="true"]');
    console.log("Lyrics containers found:", container.length);

    const rawLyrics = container
      .map((_, el) => {
        return $(el)
          .find("br")
          .replaceWith("\n")
          .end()
          .text();
      })
      .get()
      .join("\n");


    const cleanedLyrics = cleanLyrics(rawLyrics);

    res.status(200).json({
      id: song.id,
      title: song.title,
      artist: song.primary_artist.name,
      albumArt: song.song_art_image_url,
      url: song.url,
      lyrics: cleanedLyrics
    });
  } catch (err) {
    console.error("SONG ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
