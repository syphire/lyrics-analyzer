import fetch from "node-fetch";

export default async function handler(req, res) {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  try {
    const searchRes = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(title)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_KEY}`
        }
      }
    );

    if (!searchRes.ok) {
      console.error("Genius API Error Status:", searchRes.status);
      console.error("Genius API Key Present:", !!process.env.GENIUS_API_KEY);
      const errorText = await searchRes.text();
      console.error("Genius API Error Body:", errorText);
      throw new Error(`Genius search failed: ${searchRes.status} ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();

    const results = searchData.response.hits.map(hit => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      image: hit.result.song_art_image_thumbnail_url, // 👈 IMAGEN
      url: hit.result.url,
      snippet: hit.result.lyrics_state === "complete"
        ? "Lyrics available on Genius"
        : "Lyrics may be incomplete"
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
