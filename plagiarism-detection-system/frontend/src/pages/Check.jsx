import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { checkFile, checkURL, checkText, getCorpus, highlightText, highlightFile } from "../api";
import SimilarityChart from "../components/SimilarityChart";
import ScoreRing from "../components/ScoreRing";
import HighlightViewer from "../components/HighlightViewer";
import { exportReportAsPDF } from "../utils/exportPDF";
import { FileText, Link2, AlignLeft, Zap, Brain, Upload, AlertTriangle, CheckCircle, Info, Download, ScanText, SlidersHorizontal } from "lucide-react";

const TABS = [
  { id: "File", icon: FileText, label: "File Upload" },
  { id: "URL", icon: Link2, label: "URL" },
  { id: "Text", icon: AlignLeft, label: "Paste Text" },
];

export default function Check() {
  const [tab, setTab] = useState("File");
  const [mode, setMode] = useState("tfidf");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(70);
  const [showThresholdSlider, setShowThresholdSlider] = useState(false);
  const [highlightData, setHighlightData] = useState(null);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [corpus, setCorpus] = useState([]);
  const [extractedText, setExtractedText] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [],
      "text/plain": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: false,
    onDrop: (files) => {
      setFile(files[0]);
      toast.success(`${files[0].name} ready to check`);
    },
  });

  const handleCheck = async () => {
    setResult(null);
    setLoading(true);
    const toastId = toast.loading("Analyzing document...");
    try {
      let res;
      if (tab === "File" && file) res = await checkFile(file, mode);
      else if (tab === "URL" && url) res = await checkURL(url, mode);
      else if (tab === "Text" && text) res = await checkText(text, mode);
      else { toast.error("Please provide input.", { id: toastId }); setLoading(false); return; }
      setResult(res.data);
      setExtractedText(res.data.extracted_text || "");
      const corpusRes = await getCorpus();
      setCorpus(corpusRes.data);
      toast.success("Analysis complete!", { id: toastId });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const handleHighlight = async (corpusId) => {
    setHighlightLoading(true);
    const toastId = toast.loading("Loading sentence analysis...");
    try {
      let res;
      if (tab === "File" && file) {
        res = await highlightFile(file, corpusId, threshold / 100);
      } else {
        const sourceText = tab === "Text" ? text : extractedText;
        if (!sourceText) {
          toast.error("No extracted text available. Run a check first.", { id: toastId });
          setHighlightLoading(false);
          return;
        }
        res = await highlightText(sourceText, corpusId, threshold / 100);
      }
      setHighlightData(res.data);
      toast.success("Analysis ready", { id: toastId });
    } catch (e) {
      toast.error("Failed to load highlight analysis", { id: toastId });
    }
    setHighlightLoading(false);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setExportLoading(true);
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      await exportReportAsPDF(result, "similarity-chart");
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch (e) {
      toast.error("PDF export failed", { id: "pdf" });
    }
    setExportLoading(false);
  };

  const getRiskIcon = (score) => {
    if (score >= 70) return <AlertTriangle size={16} className="text-red-400" />;
    if (score >= 40) return <Info size={16} className="text-orange-400" />;
    return <CheckCircle size={16} className="text-green-400" />;
  };

  const isAboveThreshold = result && result.top_similarity >= threshold;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      {/* Highlight Viewer Modal */}
      <AnimatePresence>
        {highlightData && (
          <HighlightViewer data={highlightData} onClose={() => setHighlightData(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Plagiarism <span className="gradient-text">Detector</span>
        </h1>
        <p className="text-gray-500">Upload a file, paste a URL, or enter text to check for plagiarism against your corpus.</p>
      </motion.div>

      {/* Threshold Alert Banner */}
      <AnimatePresence>
        {isAboveThreshold && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-500/30 bg-red-500/10"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-semibold text-sm">Threshold Exceeded</p>
              <p className="text-red-300/70 text-xs mt-0.5">
                Similarity score of <span className="font-bold text-red-300">{result.top_similarity}%</span> exceeds your set threshold of <span className="font-bold text-red-300">{threshold}%</span>. This document is flagged for review.
              </p>
            </div>
            <span className="text-red-400 font-bold text-2xl shrink-0">{result.top_similarity}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-5">

          {/* Tabs */}
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {tab === "File" && (
                <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-white/10 hover:border-indigo-500/50 hover:bg-white/2"
                }`}>
                  <input {...getInputProps()} />
                  {isDragActive && <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 shimmer" />}
                  {file ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                      <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <FileText size={24} className="text-green-400" />
                      </div>
                      <p className="text-green-400 font-semibold">{file.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                        <Upload size={24} className="text-indigo-400" />
                      </div>
                      <p className="text-white font-medium mb-1">Drop your file here</p>
                      <p className="text-gray-500 text-sm">PDF, DOCX, TXT supported</p>
                    </>
                  )}
                </div>
              )}

              {tab === "URL" && (
                <div className="glass rounded-2xl p-5">
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Website URL</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
                    <Link2 size={16} className="text-gray-500 shrink-0" />
                    <input value={url} onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" />
                  </div>
                </div>
              )}

              {tab === "Text" && (
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-400 text-sm font-medium">Paste Text</label>
                    <span className="text-gray-600 text-xs">{text.length} chars</span>
                  </div>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
                    placeholder="Paste the text you want to check for plagiarism..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm transition-colors" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Mode + Threshold */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Detection Mode</p>
              <button onClick={() => setShowThresholdSlider(!showThresholdSlider)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${showThresholdSlider ? "bg-amber-500/20 text-amber-400" : "glass text-gray-400 hover:text-white"}`}>
                <SlidersHorizontal size={12} />
                Threshold: {threshold}%
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "tfidf", icon: Zap, label: "TF-IDF", desc: "Fast · Exact matches" },
                { id: "bert", icon: Brain, label: "BERT", desc: "Deep · Catches paraphrasing" },
              ].map(({ id, icon: Icon, label, desc }) => (
                <button key={id} onClick={() => setMode(id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                    mode === id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/5 hover:border-white/15 bg-white/2"
                  }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === id ? "bg-indigo-500/30" : "bg-white/5"}`}>
                    <Icon size={16} className={mode === id ? "text-indigo-400" : "text-gray-500"} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${mode === id ? "text-white" : "text-gray-400"}`}>{label}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Threshold Slider */}
            <AnimatePresence>
              {showThresholdSlider && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs">Alert Threshold</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${threshold >= 70 ? "bg-red-500/20 text-red-400" : threshold >= 40 ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>
                        {threshold}%
                      </span>
                    </div>
                    <input type="range" min="10" max="95" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer" />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>10% — Very sensitive</span>
                      <span>95% — Very strict</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Check Button */}
          <motion.button onClick={handleCheck} disabled={loading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-2xl font-semibold text-white text-sm transition-all duration-200"
            style={{ background: loading ? "#374151" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap size={16} />
                Check for Plagiarism
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center min-h-64">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">Results will appear here after analysis</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                {/* Score */}
                <div className="glass rounded-2xl p-5">
                  <ScoreRing score={result.top_similarity} />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Document</span>
                      <span className="text-white truncate max-w-32 text-right">{result.document}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Top Match</span>
                      <span className="text-indigo-400 truncate max-w-32 text-right">{result.top_match || "None"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mode</span>
                      <span className="text-purple-400 uppercase">{result.mode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Threshold</span>
                      <span className={`font-semibold ${isAboveThreshold ? "text-red-400" : "text-green-400"}`}>{threshold}% {isAboveThreshold ? "⚠ Exceeded" : "✓ Safe"}</span>
                    </div>
                  </div>

                  {/* Export PDF Button */}
                  <motion.button onClick={handleExportPDF} disabled={exportLoading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all">
                    <Download size={14} />
                    {exportLoading ? "Generating..." : "Export PDF Report"}
                  </motion.button>
                </div>

                {/* Match List */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-sm font-semibold">Matched Sources</p>
                  </div>
                  <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                    {result.matches.map((m, i) => {
                      const corpusDoc = corpus.find((c) => c.filename === m.filename);
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors group">
                          <div className="flex items-center gap-2 min-w-0">
                            {getRiskIcon(m.similarity)}
                            <span className="text-gray-300 text-xs truncate">{m.filename}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`text-xs font-bold ${m.similarity >= 70 ? "text-red-400" : m.similarity >= 40 ? "text-orange-400" : "text-green-400"}`}>
                              {m.similarity}%
                            </span>
                            {corpusDoc && (
                              <motion.button
                                onClick={() => handleHighlight(corpusDoc.id)}
                                disabled={highlightLoading}
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                title="View sentence-level matches"
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/30 transition-all">
                                <ScanText size={12} />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Chart */}
      {result && (
        <div id="similarity-chart">
          <SimilarityChart matches={result.matches} />
        </div>
      )}
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}
