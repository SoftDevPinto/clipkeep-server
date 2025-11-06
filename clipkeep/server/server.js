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

app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).send("Missing video URL");

    console.log("🎬 Download requested for:", url);

    const apiRes = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const data = await apiRes.json();
    console.log("🧾 TikWM response (short):", {
      success: data.code === 0,
      videoUrl: data?.data?.play,
      wmUrl: data?.data?.wmplay,
    });

    if (!data.data?.play) {
      console.error("⚠️ No valid video URL in TikWM response");
      return res.status(400).send("Invalid TikTok URL or private video");
    }

    const videoUrl = data.data.play;
    console.log("🎥 Fetching actual MP4 from:", videoUrl);

    const videoRes = await fetch(videoUrl);
    console.log("🎥 Video response headers:", Object.fromEntries(videoRes.headers));

    if (!videoRes.ok) {
      console.error("❌ Video fetch failed:", videoRes.statusText);
      return res.status(500).send("Failed to fetch MP4");
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("✅ Downloaded video bytes:", buffer.length);

    if (buffer.length < 50000) {
      console.warn("⚠️ Video too small; likely invalid file");
    }

    res.setHeader("Content-Type", "video/mp4");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).send("Error downloading video.");
  }
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
