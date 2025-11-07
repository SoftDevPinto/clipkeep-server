import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [toast, setToast] = useState("");
  

const [downloadCount, setDownloadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"

);

const API_BASE = import.meta.env.PROD
  ? "https://clipkeep.onrender.com"
  : "http://localhost:10000";

// 📡 Fetch global download count from backend
useEffect(() => {
  fetch(`${API_BASE}/stats`)
    .then((res) => res.json())
    .then((data) => setDownloadCount(data.total || 0))
    .catch(() => setDownloadCount(0));
}, []);

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);
  

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!url.trim()) return;
  setLoading(true);
  setLog("Fetching video info...");

  try {
    // send only the url; backend auto-detects the platform
    const res = await fetch(`${API_BASE}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    setVideoInfo({
      thumbnail: data.thumbnail || null,
      title: data.title || "",
      videoUrl: data.videoUrl,
    });

    setLog("✅ Video found! Downloading automatically...");

    
// 🧮 Refresh global counter after successful download
fetch(`${API_BASE}/stats`)
  .then((res) => res.json())
  .then((data) => setDownloadCount(data.total || 0))
  .catch(() => {});

    // 🔁 IMPORTANT: fetch BYTES via our proxy, not the CDN directly
    const proxied = await fetch(
      `${API_BASE}/proxy?url=${encodeURIComponent(data.videoUrl)}`
    );

    if (!proxied.ok) throw new Error("Failed to fetch video bytes");

    const blob = await proxied.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const shortId = Math.floor(1000 + Math.random() * 9000);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `clipkeep_${shortId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    setLog("✅ Video downloaded successfully!");
  } catch (err) {
    setLog("❌ Error: " + err.message);
  } finally {
    setLoading(false);
  }
};






// ✅ Load Ad Scripts once on mount
useEffect(() => {
  // --- 1️⃣ Native Banner (bottom ad) ---
  const nativeScript = document.createElement("script");
  nativeScript.async = true;
  nativeScript.setAttribute("data-cfasync", "false");
  nativeScript.src =
    "//pl28005821.effectivegatecpm.com/a34618341809999ade3e956b7587ae82/invoke.js";
  document.body.appendChild(nativeScript);

  // --- 2️⃣ Banner (300x250) under Download button ---
  const bannerContainer = document.getElementById("adsterra-banner-300x250");
  if (bannerContainer) {
    // Inline ad setup script (defines atOptions)
    const bannerSetup = document.createElement("script");
    bannerSetup.type = "text/javascript";
    bannerSetup.innerHTML = `
      atOptions = {
        'key': '9cdabcab43ba9ae9e5ade9cf1b41856b',
        'format': 'iframe',
        'height': 250,
        'width': 300,
        'params': {}
      };
    `;
    bannerContainer.appendChild(bannerSetup);

    // External ad script loader
    const bannerScript = document.createElement("script");
    bannerScript.type = "text/javascript";
    bannerScript.src = "//www.highperformanceformat.com/9cdabcab43ba9ae9e5ade9cf1b41856b/invoke.js";
    bannerContainer.appendChild(bannerScript);
  }

  // 🧹 Cleanup: remove scripts when component unmounts
  return () => {
    document
      .querySelectorAll(
        "script[src*='effectivegatecpm'], script[src*='highperformanceformat']"
      )
      .forEach((el) => el.remove());
  };
}, []);

// 🧩 Load Ad after videoInfo changes
useEffect(() => {
  if (!videoInfo) return; // only run after video loads

  const container = document.getElementById("adsterra-banner-300x250");
  if (!container) return;

  // Inline ad setup
  const setupScript = document.createElement("script");
  setupScript.innerHTML = `
    atOptions = {
      'key': '9cdabcab43ba9ae9e5ade9cf1b41856b',
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };
  `;
  container.appendChild(setupScript);

  // External script
  const adScript = document.createElement("script");
  adScript.src =
    "//www.highperformanceformat.com/9cdabcab43ba9ae9e5ade9cf1b41856b/invoke.js";
  container.appendChild(adScript);

  return () => {
    container.innerHTML = "";
  };
}, [videoInfo]);

  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="w-full py-5 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            ClipKeep<span className="text-blue-600">.</span>
          </h1>
          <nav>
            <a
              href="https://clipkeeper.netlify.app"
              className="text-gray-500 hover:text-blue-600 transition"
            >
              {/* Home */}
            </a>
          </nav>
          <button
  onClick={() => setDarkMode(!darkMode)}
  className="ml-3 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
>
  {darkMode ? "☀️" : "🌙"}
</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 sm:pt-28">
     <div className="max-w-2xl w-full bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">

       <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
  Download TikTok & Instagram Reels
</h2>
<p className="text-gray-500 dark:text-gray-400 mb-8">
  Over {downloadCount.toLocaleString()} videos downloaded 🎉
</p>
<p className="text-gray-500 dark:text-gray-400 mb-8">
  Paste a TikTok or Instagram Reel link below to download your video instantly.
</p>

          <form
  onSubmit={handleSubmit}
  className="flex flex-col sm:flex-row gap-4 mb-6 items-center"
>
<div className="flex flex-1 items-stretch border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
  <input
    type="text"
    placeholder="Paste TikTok or Instagram link here..."
    value={url}
    onChange={(e) => setUrl(e.target.value)}
    className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
  />
  <button
    type="button"
    onClick={async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text.includes("tiktok.com") || text.includes("instagram.com")) {
          setUrl(text.trim());
          setLog("📋 Pasted video link from clipboard!");
        } else {
          setLog("⚠️ Clipboard doesn’t contain a valid TikTok or Instagram link.");
        }
      } catch {
        setLog("⚠️ Could not access clipboard (browser blocked).");
      }
    }}
    className="px-5 py-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
  >
    Paste
  </button>
</div>


  <button
    type="submit"
    disabled={loading}
    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50 mt-3 sm:mt-0"
  >
    {loading ? (
      <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
        <span>Working...</span>
      </div>
    ) : (
      "Download"
    )}
  </button>
</form>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left text-sm text-gray-700 dark:text-gray-200 h-32 overflow-auto">

            {log || "Logs will appear here..."}
          </div>
{videoInfo && (
  <div className="mt-6 text-center">
    {videoInfo.thumbnail ? (
      <img
        src={videoInfo.thumbnail}
        alt="Video thumbnail"
        className="w-full rounded-xl mb-3 shadow-sm"
      />
    ) : (
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-xl mb-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          🎥 No thumbnail available
        </span>
      </div>
    )}

    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">
      {videoInfo.title}
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-3">
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.href = videoInfo.videoUrl;
          const shortId = Math.floor(1000 + Math.random() * 9000);
          link.download = `clipkeep_${shortId}.mp4`;
          link.click();
        }}
        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition"
      >
        Download Video
      </button>

      <button
        onClick={() => {
          navigator.clipboard.writeText(videoInfo.title || "");
          setToast("Caption copied!");
          setTimeout(() => setToast(""), 2000);
        }}
        className="flex-1 px-6 py-3 rounded-xl border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition"
      >
        Copy Caption
      </button>
    </div>
    {/* 🧩 Adsterra Banner (300x250) below download buttons */}
<div className="my-6 w-full flex justify-center">
  <div id="adsterra-banner-300x250"></div>
</div>
  </div>
)}
          </div>
        

{/* Info Section */}
<section className="max-w-3xl w-full mt-16 text-left bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
<h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
  Download TikTok Videos & Instagram Reels in HD
</h3>

<p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
  ClipKeep lets you download TikTok videos and Instagram Reels quickly, in HD quality, and without watermarks — completely free. 
  No software installs or apps needed — just paste the link and hit download.
</p>


  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-gray-700 dark:text-gray-200 leading-relaxed space-y-4 transition-colors duration-300">
    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
      Key Features:
    </h4>

    <ul className="list-disc list-inside space-y-2">
      <li>No watermark — get cleaner, higher-quality videos than TikTok’s native download.</li>
      <li>Works on any device: mobile, tablet, or desktop.</li>
      <li>Browser-based — no need to install any app or extension.</li>
      <li>Completely free and always available.</li>
      <li>Supports downloading TikTok slideshows as MP4 videos too.</li>
    </ul>

    <p className="pt-3 text-sm text-gray-500 dark:text-gray-400">
      Similar to tools like SnapTik, ClipKeep handles everything server-side for privacy and speed.
    </p>
  </div>
</section>


        {/* 🧩 Native Banner Ad (below content, above footer) */}
      {/* 🧩 Native Banner Ad (below content, above footer) */}
<div
  id="container-a34618341809999ade3e956b7587ae82"
  className="my-10"
></div>

      </main>

      {/* ✅ Toast Notification */}
<AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2 rounded-full shadow-lg"
    >
      {toast}
    </motion.div>
  )}
</AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">

        Built by <span className="font-semibold text-gray-700">Pinto</span>
      </footer>
    </div>
  );
}
