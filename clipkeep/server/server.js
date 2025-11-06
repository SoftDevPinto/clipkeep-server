import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: "*"})); // later: lock to your frontend domain
app.use(express.json());

app.get("/", (req, res) => res.send("ClipKeep backend is running ✅"));

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");
  try {
    // Your working fetch-based downloader here
    const remote = await fetch(/* your working endpoint using url */);
    if (!remote.ok) throw new Error("Failed to fetch video");
    const buf = Buffer.from(await remote.arrayBuffer());
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=clipkeep_video.mp4");
    res.send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).send("Download failed: " + e.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
