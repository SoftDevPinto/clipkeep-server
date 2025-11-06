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

    const metaResponse = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    const text = await metaResponse.text();
    console.log("🧾 TikWM response (first 500 chars):", text.slice(0, 500));

    let metaData;
    try {
      metaData = JSON.parse(text);
    } catch {
      console.error("❌ Could not parse TikWM JSON");
      return res.status(500).send("Invalid TikWM API response.");
    }

    const videoUrl = metaData?.data?.play;
    if (!videoUrl) {
      console.error("❌ TikWM returned no playable video link.");
      return res.status(500).send("TikWM returned no playable video link.");
    }

    console.log("🎥 Direct video URL:", videoUrl);

    // Download video
    const videoResponse = await fetch(videoUrl, { redirect: "follow" });
    const contentType = videoResponse.headers.get("content-type");
    console.log("📦 Video response type:", contentType);

    if (!contentType || !contentType.includes("video")) {
      const bodyText = await videoResponse.text();
      console.error("❌ Invalid content (first 500 chars):", bodyText.slice(0, 500));
      return res.status(500).send("Video link did not return valid MP4.");
    }

    // Stream to client
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
