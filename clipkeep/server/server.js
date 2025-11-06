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

    console.log("🎬 Fetching TikTok metadata for:", url);

    // Fetch metadata from TikWM
    const metaResponse = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const metaData = await metaResponse.json();
    const videoUrl = metaData?.data?.play;
    if (!videoUrl) throw new Error("No playable video found");

    console.log("🎥 Direct video URL:", videoUrl);

    // Follow redirects and request as a stream
    const videoResponse = await fetch(videoUrl, { redirect: "follow" });
    const contentType = videoResponse.headers.get("content-type");

    // Check for actual video content
    if (!contentType || !contentType.includes("video")) {
      const text = await videoResponse.text();
      console.error("❌ Not a video response, got:", text.slice(0, 200));
      return res.status(500).send("Video URL returned invalid content.");
    }

    // Stream video to browser
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="clipkeep_video.mp4"'
    );

    videoResponse.body.pipe(res);
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).send("Error downloading video.");
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
