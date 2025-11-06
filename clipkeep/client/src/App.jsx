import { useState, useEffect } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const API_BASE = import.meta.env.PROD
    ? "https://clipkeep.onrender.com"
    : "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setLog("Downloading video...");
    try {
      const res = await fetch(`${API_BASE}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "clipkeep_video.mp4";
      link.click();
      setLog("✅ Video downloaded successfully!");
    } catch (err) {
      setLog("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load Ad Script once on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "//pl28001066.effectivetagetcpm.com/8b570539cb21f267938557efb4d7cb1a/invoke.js";
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
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
              Home
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 sm:pt-28">
        <div className="max-w-lg w-full bg-white shadow-lg rounded-3xl p-8 border border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">
            Download TikTok Videos
          </h2>
          <p className="text-gray-500 mb-8">
            Paste your TikTok link below to download the video instantly.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <input
              type="text"
              placeholder="https://www.tiktok.com/@user/video/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Working..." : "Download"}
            </button>
          </form>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-sm text-gray-700 h-32 overflow-auto">
            {log || "Logs will appear here..."}
          </div>
        </div>

        {/* Info Section */}
        <section className="max-w-3xl w-full mt-16 text-left bg-white rounded-3xl p-10 shadow-md border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            Download TikTok Videos Without Watermark
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            ClipKeep lets you download TikTok videos quickly, in HD quality, and
            without any watermark — completely free. No software installs or app
            downloads needed — just paste the link and hit download.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-gray-700 leading-relaxed space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Key Features:
            </h4>
            <ul className="list-disc list-inside space-y-2">
              <li>
                No watermark — get cleaner, higher-quality videos than TikTok’s
                native download.
              </li>
              <li>Works on any device: mobile, tablet, or desktop.</li>
              <li>Browser-based — no need to install any app or extension.</li>
              <li>Completely free and always available.</li>
              <li>Supports downloading TikTok slideshows as MP4 videos too.</li>
            </ul>

            <p className="pt-3 text-sm text-gray-500">
              Similar to tools like SnapTik, ClipKeep handles everything
              server-side for privacy and speed.
            </p>
          </div>
        </section>

        {/* 🧩 Native Banner Ad (below content, above footer) */}
        <div
          id="container-8b570539cb21f267938557efb4d7cb1a"
          className="my-10"
        ></div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-gray-200 bg-white text-center text-sm text-gray-500">
        Built by <span className="font-semibold text-gray-700">Pinto</span>
      </footer>
    </div>
  );
}
