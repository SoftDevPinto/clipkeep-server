import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: "*"})); // later: lock to your frontend domain
app.use(express.json());

app.get("/", (req, res) => res.send("ClipKeep backend is running ✅"));

app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      console.error("❌ No URL received in request body:", req.body);
      return res.status(400).send("Missing video URL");
    }

    console.log("⬇️ Download request received for:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log("Response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to fetch TikTok video (status ${response.status})`);

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "video/mp4");
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).send("Error downloading video.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
