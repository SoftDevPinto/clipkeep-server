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

    console.log("🎬 Fetching TikTok video metadata:", url);

    // Use TikWM API to get the playable MP4 link
    const metaResponse = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const metaData = await metaResponse.json();
    if (!metaData?.data?.play) throw new Error("No playable video found");

    const videoUrl = metaData.data.play;
    console.log("🎥 Direct video URL:", videoUrl);

    // Stream the file to the browser instead of loading it fully in memory
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok)
      throw new Error(`Video fetch failed (${videoResponse.status})`);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="clipkeep_video.mp4"'
    );

    // ✅ Stream the response directly — avoids corruption
    videoResponse.body.pipe(res);
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).send("Error downloading video.");
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
