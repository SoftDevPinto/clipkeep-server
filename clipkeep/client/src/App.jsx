import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setLog("Downloading video...");
    try {
      const res = await fetch("https://clipkeep-server.onrender.com/download", {
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

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">ClipKeep 🎥</h1>
        <p className="text-gray-500 mb-6">
          Paste a TikTok link to download your video.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="https://www.tiktok.com/@user/video/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-300 rounded-lg flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Working..." : "Download"}
          </button>
        </form>

        <pre className="bg-gray-50 text-left mt-6 p-4 rounded-lg text-sm text-gray-700 h-36 overflow-auto">
          {log}
        </pre>
      </div>
    </div>
  );
}
