import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: ["https://clipkeeper.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.get("/", (req, res) => res.send("ClipKeep backend is running ✅"));

// ✅ TikTok video downloader using tikwm.com API
app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).send("Missing video URL");

    console.log("🎬 Fetching TikTok metadata for:", url);

    // TikWM API request (no API key required)
    const apiRes = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const data = await apiRes.json();
    console.log("🧾 TikWM response:", data);

    if (!data.data || !data.data.play) {
      throw new Error("No valid download link returned");
    }

    // Fetch the actual MP4 file
    const videoUrl = data.data.play;
    console.log("🎥 Direct video URL:", videoUrl);

    const videoRes = await fetch(videoUrl);
    const arrayBuffer = await videoRes.arrayBuffer();

    res.setHeader("Content-Type", "video/mp4");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).send("Error downloading video.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
