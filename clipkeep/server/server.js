import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// ✅ Proper CORS configuration
app.use(
  cors({
    origin: [
      "https://clipkeeper.netlify.app", // your live frontend
      "http://localhost:5173"           // local dev
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("✅ ClipKeep backend is running!"));

app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).send("Missing video URL");

    console.log("Fetching TikTok metadata for:", url);

    // TikWM API gives the real video URL (no watermark)
    const api = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const data = await api.json();
    if (!data?.data?.play) throw new Error("No playable video found");

    const videoUrl = data.data.play;
    console.log("Downloading video from:", videoUrl);

    const video = await fetch(videoUrl);
    const buffer = Buffer.from(await video.arrayBuffer());

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="clipkeep_video.mp4"');
    res.send(buffer);
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).send("Error downloading video.");
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
