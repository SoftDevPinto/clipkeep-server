import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import fs from "fs";

const COUNTER_FILE = "./downloads.json";
if (!fs.existsSync(COUNTER_FILE)) {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ total: 0 }));
}

const app = express();
app.use(
  cors({
    origin: [
      "https://clipkeeper.netlify.app",
      "https://clipkeep.live", // ✅ your new domain
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("ClipKeep backend is running ✅"));

app.post("/download", async (req, res) => {
  try {

    // 🧮 Increment global counter
try {
  const counter = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
  counter.total += 1;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(counter));
} catch (err) {
  console.error("⚠️ Failed to update download counter:", err);
}
    const { url, platform } = req.body;
    if (!url) return res.status(400).send("Missing video URL");

    let detected = platform;
    if (!detected) {
      if (url.includes("tiktok.com")) detected = "tiktok";
      else if (url.includes("instagram.com")) detected = "instagram";
    }
    if (!detected) return res.status(400).send("Unsupported URL");

    console.log(`🎬 Download requested for: ${url} [${detected}]`);

    
    
  app.get("/stats", (req, res) => {
  try {
    const counter = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
    res.json(counter);
  } catch {
    res.json({ total: 0 });
  }
});
  

    // ---------- INSTAGRAM (SaveIG / SnapSave backend) ----------
// ---------- INSTAGRAM (via RapidAPI) ----------
if (detected === "instagram") {
  console.log("📸 Fetching Instagram reel via RapidAPI...");

  const apiUrl = `https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(url)}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "instagram-reels-downloader-api.p.rapidapi.com",
      "x-rapidapi-key": "921f6a23cbmshc54bfc49e788c1cp182a67jsnba9eaddf96d6",
    },
  });

  const data = await response.json();
  console.log("📦 RapidAPI response:", data);

  // 🧠 Extract the video URL safely (API returns it inside medias array)
  let videoUrl = null;

  if (data?.data?.url?.includes(".mp4")) {
    videoUrl = data.data.url;
  } else if (Array.isArray(data?.data?.medias)) {
    const mp4 = data.data.medias.find((m) =>
      m.url?.includes(".mp4")
    );
    videoUrl = mp4?.url || null;
  }

  if (!videoUrl) {
    console.error("⚠️ No video URL found in RapidAPI response");
    return res.status(400).send("Instagram reel not found or blocked.");
  }

  const thumbnail =
    data?.data?.thumbnail || data?.data?.medias?.[0]?.preview || "";
  const title = data?.data?.title || "Instagram Reel";

  return res.json({
    platform: "instagram",
    videoUrl,
    thumbnail,
    title,
  });
}




    // ---------- TIKTOK ----------
    if (detected === "tiktok") {
      const apiRes = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url }),
      });

      const data = await apiRes.json();
      if (!data?.data?.play) {
        console.error("⚠️ No valid video URL in TikWM response");
        return res.status(400).send("Invalid TikTok URL or private video");
      }

      const videoUrl = data.data.play;
      const thumbnail = data.data.cover;
      const title = data.data.title || "TikTok Video";

      return res.json({
        platform: "tiktok",
        videoUrl,
        thumbnail,
        title,
      });
    }

    return res.status(400).send("Unsupported platform");
  } catch (err) {
    console.error("❌ Error in /download:", err);
    if (!res.headersSent) {
      res.status(500).send("Error downloading video.");
    }
  }
});

// ---------- Proxy ----------
app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send("Missing url");

    const upstream = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "*/*",
      },
    });

    if (!upstream.ok) {
      console.error("⚠️ Upstream error:", upstream.statusText);
      return res
        .status(upstream.status)
        .send(`Upstream error: ${upstream.statusText}`);
    }

    const ct = upstream.headers.get("content-type") || "video/mp4";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "no-store");
    upstream.body.pipe(res);
  } catch (e) {
    console.error("❌ Proxy error:", e);
    if (!res.headersSent) res.status(500).send("Proxy failed");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
