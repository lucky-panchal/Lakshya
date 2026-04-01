import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { checkFile, checkURL, checkText, getCorpus, highlightText, highlightFile } from "../api";
import SimilarityChart from "../components/SimilarityChart";
import HighlightViewer from "../components/HighlightViewer";
import ResultDisplayOptions from "../components/ResultDisplayOptions";
import ProfessionalLayout, { 
  ProfessionalHeader, 
  ProfessionalSection, 
  ProfessionalCard, 
  ProfessionalButton, 
  ProfessionalGrid,
  ProfessionalBadge 
} from "../components/ProfessionalLayout";
import { exportReportAsPDF } from "../utils/exportPDF";
import { FileText, Link2, AlignLeft, Zap, Brain, Upload, AlertTriangle, Download, ScanText, SlidersHorizontal, Eye, Settings } from "lucide-react";

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
  const [exportLoading, setExportLoading] = useState(false);
  const [corpus, setCorpus] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [inlineHighlight, setInlineHighlight] = useState(null);
  const [resultDisplayMode, setResultDisplayMode] = useState("summary");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [corpusEmpty, setCorpusEmpty] = useState(false);
  const navigate = useNavigate();

  // Check if corpus is empty on mount
  useEffect(() => {
    getCorpus().then(res => setCorpusEmpty(res.data.length === 0)).catch(() => {});
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [],
      "text/plain": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: false,
    onDrop: (files) => {
      const f = files[0];
      if (f.size > 10 * 1024 * 1024) {
        toast.error("File exceeds 10MB limit. Please upload a smaller file.");
        return;
      }
      setFile(f);
      toast.success(`${f.name} ready`);
    },
  });

  const handleCheck = async () => {
    setResult(null); setInlineHighlight(null); setLoading(true);
    const toastId = toast.loading(mode === "bert" ? "Loading BERT model..." : "Analyzing document...");
    try {
      let res;
      if (tab === "File" && file) res = await checkFile(file, mode);
      else if (tab === "URL" && url) res = await checkURL(url, mode);
      else if (tab === "Text" && text) res = await checkText(text, mode);
      else { toast.error("Please provide input.", { id: toastId }); setLoading(false); return; }

      if (mode === "bert") toast.loading("Comparing with corpus...", { id: toastId });

      setResult(res.data);
      setExtractedText(res.data.extracted_text || "");
      const corpusRes = await getCorpus();
      setCorpus(corpusRes.data);
      setCorpusEmpty(corpusRes.data.length === 0);
      toast.success("Analysis complete!", { id: toastId });
      if (res.data.matches?.length > 0) {
        const topDoc = corpusRes.data.find((c) => c.filename === res.data.matches[0].filename);
        if (topDoc) {
          try {
            const hlRes = tab === "File" && file
              ? await highlightFile(file, topDoc.id, 0.4)
              : await highlightText(res.data.extracted_text || (tab === "Text" ? text : url), topDoc.id, 0.4);
            setInlineHighlight(hlRes.data);
          } catch (_) {}
        }
      }
    } catch (e) {
      toast.error(e.friendlyMessage || e.response?.data?.detail || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const handleHighlight = async (corpusId) => {
    const toastId = toast.loading("Loading sentence analysis...");
    try {
      const sourceText = tab === "Text" ? text : extractedText;
      const res = tab === "File" && file
        ? await highlightFile(file, corpusId, threshold / 100)
        : await highlightText(sourceText, corpusId, threshold / 100);
      setHighlightData(res.data);
      toast.success("Analysis ready", { id: toastId });
    } catch (e) {
      toast.error("Failed to load highlight analysis", { id: toastId });
    }
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

  const isAboveThreshold = result && result.top_similarity >= threshold;

  return (
    <ProfessionalLayout fullWidth>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      <AnimatePresence>
        {highlightData && <HighlightViewer data={highlightData} onClose={() => setHighlightData(null)} />}
      </AnimatePresence>

      {/* Professional Header - Left title, Right controls */}
      <ProfessionalHeader
        title={<>Plagiarism <span className="gradient-text">Detector</span></>}
        subtitle="Check documents against your corpus using advanced NLP algorithms"
        rightContent={
          <ProfessionalSection spacing="tight">
            <ProfessionalButton
              variant="secondary"
              size="small"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={showAdvancedOptions ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : ""}
            >
              <Settings size={14} className="mr-2" />
              Advanced
            </ProfessionalButton>
            <ProfessionalButton
              variant="secondary"
              size="small"
              onClick={() => setShowThresholdSlider(!showThresholdSlider)}
              className={showThresholdSlider ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : ""}
            >
              <SlidersHorizontal size={14} className="mr-2" />
              Threshold: {threshold}%
            </ProfessionalButton>
          </ProfessionalSection>
        }
      />

      {/* Empty corpus warning banner */}
      {corpusEmpty && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 rounded-2xl border border-amber-500/30 bg-amber-500/8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-semibold text-sm">Corpus is Empty</p>
                <p className="text-amber-300/60 text-xs mt-0.5">You need to upload reference documents before running a check.</p>
              </div>
            </div>
            <ProfessionalButton
              variant="secondary"
              size="small"
              onClick={() => navigate("/corpus")}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/15 shrink-0"
            >
              Go to Corpus →
            </ProfessionalButton>
          </div>
        </motion.div>
      )}
      <AnimatePresence>
        {showThresholdSlider && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} 
            className="overflow-hidden mb-6"
          >
            <ProfessionalCard className="flex items-center gap-6">
              <p className="text-gray-400 text-sm font-medium shrink-0">Alert Threshold</p>
              <input 
                type="range" 
                min="10" 
                max="95" 
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer" 
              />
              <ProfessionalBadge 
                variant={threshold >= 70 ? "error" : threshold >= 40 ? "warning" : "success"}
                size="normal"
              >
                {threshold}%
              </ProfessionalBadge>
              <ProfessionalSection alignment="right" spacing="tight">
                <span className="text-xs text-gray-600">10% sensitive</span>
                <span className="text-xs text-gray-600">95% strict</span>
              </ProfessionalSection>
            </ProfessionalCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Options Panel */}
      <AnimatePresence>
        {showAdvancedOptions && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} 
            className="overflow-hidden mb-6"
          >
            <ProfessionalCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold text-sm mb-3">Result Display Options</h4>
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                    {[
                      { id: "summary", label: "Summary", icon: Eye },
                      { id: "detailed", label: "Detailed", icon: FileText },
                      { id: "visual", label: "Visual", icon: ScanText }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setResultDisplayMode(id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          resultDisplayMode === id
                            ? "bg-indigo-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-3">Export Options</h4>
                  <ProfessionalSection spacing="tight">
                    <ProfessionalButton variant="secondary" size="small">
                      <Download size={12} className="mr-2" />
                      Quick PDF
                    </ProfessionalButton>
                    <ProfessionalButton variant="secondary" size="small">
                      <Download size={12} className="mr-2" />
                      Full Report
                    </ProfessionalButton>
                  </ProfessionalSection>
                </div>
              </div>
            </ProfessionalCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threshold Alert Banner */}
      <AnimatePresence>
        {isAboveThreshold && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <ProfessionalCard className="border border-red-500/30 bg-red-500/8">
              <ProfessionalSection alignment="between">
                <ProfessionalSection spacing="tight">
                  <AlertTriangle size={18} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Threshold Exceeded</p>
                    <p className="text-red-300/60 text-xs mt-0.5">
                      Score <span className="font-bold text-red-300">{result.top_similarity}%</span> exceeds threshold of <span className="font-bold text-red-300">{threshold}%</span>
                    </p>
                  </div>
                </ProfessionalSection>
                <span className="text-red-400 font-bold text-xl">{result.top_similarity}%</span>
              </ProfessionalSection>
            </ProfessionalCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid — full width on mobile, 3+2 on desktop */}
      <ProfessionalGrid cols="auto" gap="normal">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-4"
        >
          {/* Tab Navigation */}
          <ProfessionalCard padding="tight">
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {TABS.map(({ id, icon: Icon, label }) => (
                <ProfessionalButton
                  key={id}
                  variant={tab === id ? "primary" : "secondary"}
                  size="small"
                  onClick={() => setTab(id)}
                  className={`flex-1 sm:flex-none ${tab === id ? "" : ""}`}
                >
                  <Icon size={13} className="mr-1.5" />
                  {label}
                </ProfessionalButton>
              ))}
            </div>
          </ProfessionalCard>

          {/* Input Content Area */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} 
              transition={{ duration: 0.15 }}
            >
              {tab === "File" && (
                <ProfessionalCard 
                  className={`border-2 border-dashed cursor-pointer transition-all ${
                    isDragActive ? "border-indigo-500 bg-indigo-500/8" : "border-white/8 hover:border-indigo-500/40"
                  }`}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <ProfessionalSection spacing="tight">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      file ? "bg-green-500/15" : "bg-indigo-500/15"
                    }`}>
                      {file ? 
                        <FileText size={22} className="text-green-400" /> : 
                        <Upload size={22} className="text-indigo-400" />
                      }
                    </div>
                    <div>
                      <p className={`font-medium ${file ? "text-green-400" : "text-white"}`}>
                        {file ? file.name : "Drop your file here"}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : "PDF, DOCX, TXT supported · Click to browse"}
                      </p>
                    </div>
                  </ProfessionalSection>
                </ProfessionalCard>
              )}

              {tab === "URL" && (
                <ProfessionalCard>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Website URL
                  </label>
                  <ProfessionalSection 
                    spacing="tight" 
                    className="border border-white/8 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <Link2 size={15} className="text-gray-500 shrink-0" />
                    <input 
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" 
                    />
                  </ProfessionalSection>
                </ProfessionalCard>
              )}

              {tab === "Text" && (
                <ProfessionalCard>
                  <ProfessionalSection alignment="between" className="mb-3">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Paste Text
                    </label>
                    <span className="text-gray-600 text-xs">{text.length} characters</span>
                  </ProfessionalSection>
                  <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    rows={7}
                    placeholder="Paste the text you want to check..."
                    className="w-full border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 resize-none text-sm transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#fff" }}
                  />
                </ProfessionalCard>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Detection Mode Selection */}
          <ProfessionalCard>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Detection Mode
            </p>
            <ProfessionalGrid cols="2" gap="tight">
              {[
                { id: "tfidf", icon: Zap, label: "TF-IDF", desc: "Fast · Exact matches" },
                { id: "bert", icon: Brain, label: "BERT", desc: "Deep · Catches paraphrasing" },
              ].map(({ id, icon: Icon, label, desc }) => (
                <button 
                  key={id} 
                  onClick={() => setMode(id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    mode === id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/5 bg-white/2 hover:border-white/12"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === id ? "bg-indigo-500/25" : "bg-white/5"
                  }`}>
                    <Icon size={16} className={mode === id ? "text-indigo-400" : "text-gray-500"} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${mode === id ? "text-white" : "text-gray-400"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </ProfessionalGrid>
          </ProfessionalCard>

          {/* Check Button */}
          <ProfessionalButton
            variant="primary"
            size="large"
            onClick={handleCheck}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" 
                />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={15} className="mr-2" /> 
                Check for Plagiarism
              </>
            )}
          </ProfessionalButton>
        </motion.div>

        {/* Right Panel — full width on mobile, 2 cols on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {!result ? (
            <ProfessionalCard className="flex flex-col items-center justify-center min-h-72 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                <SearchIcon size={22} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium text-sm">No results yet</p>
              <p className="text-gray-600 text-xs mt-1">Submit a document to see analysis</p>
            </ProfessionalCard>
          ) : (
            <AnimatePresence>
              <motion.div 
                key="result" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Display Options Component */}
                <ResultDisplayOptions 
                  result={result}
                  currentMode={resultDisplayMode}
                  onModeChange={setResultDisplayMode}
                />

                {/* Export Actions */}
                <ProfessionalCard>
                  <ProfessionalSection alignment="between">
                    <div>
                      <p className="text-white font-semibold text-sm">Export Report</p>
                      <p className="text-gray-500 text-xs">Download analysis in different formats</p>
                    </div>
                    <ProfessionalSection spacing="tight">
                      <ProfessionalButton
                        variant="secondary"
                        size="small"
                        onClick={handleExportPDF}
                        disabled={exportLoading}
                      >
                        <Download size={12} className="mr-2" />
                        {exportLoading ? "Generating..." : "PDF Report"}
                      </ProfessionalButton>
                    </ProfessionalSection>
                  </ProfessionalSection>
                </ProfessionalCard>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </ProfessionalGrid>

      {/* Professional Chart Section - Full width with left-aligned title */}
      {result && (
        <div id="similarity-chart" className="mt-8">
          <SimilarityChart matches={result.matches} />
        </div>
      )}

      {/* Inline Sentence Preview */}
      <AnimatePresence>
        {inlineHighlight && inlineHighlight.matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <ProfessionalCard className="overflow-hidden p-0">
              <ProfessionalSection alignment="between" className="px-4 sm:px-6 py-4 border-b border-white/5 flex-wrap gap-3">
                <div>
                  <p className="text-white font-semibold text-sm">Matched Sentences Preview</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Against <span className="text-indigo-400">{inlineHighlight.corpus_filename}</span>
                    <span className="mx-2 text-gray-700">·</span>
                    <span className="text-gray-500">{inlineHighlight.matches.length} sentence matches</span>
                  </p>
                </div>
                <ProfessionalButton
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const topDoc = corpus.find((c) => c.filename === inlineHighlight.corpus_filename);
                    if (topDoc) handleHighlight(topDoc.id);
                  }}
                  className="bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border-indigo-500/20"
                >
                  <ScanText size={12} className="mr-2" />
                  View Full Analysis
                </ProfessionalButton>
              </ProfessionalSection>

              {/* Professional Match Display */}
              <div className="divide-y divide-white/5">
                {inlineHighlight.matches.slice(0, 3).map((match, i) => {
                  const srcSent = inlineHighlight.source_sentences[match.source_index];
                  const corpSent = inlineHighlight.corpus_sentences[match.corpus_index];
                  const variant = match.score >= 70 ? "error" : match.score >= 40 ? "warning" : "success";
                  const borderColor = match.score >= 70 ? "border-red-500/50" : match.score >= 40 ? "border-orange-500/50" : "border-yellow-500/50";
                  
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className={`px-6 py-5 border-l-2 ${borderColor}`}
                    >
                      <ProfessionalSection alignment="between" className="mb-3">
                        <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                          Match {i + 1}
                        </span>
                        <ProfessionalBadge variant={variant} size="small">
                          {match.score}%
                        </ProfessionalBadge>
                      </ProfessionalSection>
                      
                      {/* Side by side on md+, stacked on mobile */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Your Document</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{srcSent}</p>
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                          <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Corpus Document</p>
                          <p className="text-purple-300/80 text-sm leading-relaxed">{corpSent}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {inlineHighlight.matches.length > 3 && (
                <ProfessionalSection alignment="between" className="px-4 sm:px-6 py-3 border-t border-white/5">
                  <span className="text-gray-600 text-xs">
                    {inlineHighlight.matches.length - 3} more matches hidden
                  </span>
                  <button 
                    onClick={() => {
                      const topDoc = corpus.find((c) => c.filename === inlineHighlight.corpus_filename);
                      if (topDoc) handleHighlight(topDoc.id);
                    }} 
                    className="text-indigo-400 text-xs hover:text-indigo-300 font-medium transition-colors"
                  >
                    View all {inlineHighlight.matches.length} →
                  </button>
                </ProfessionalSection>
              )}
            </ProfessionalCard>
          </motion.div>
        )}
      </AnimatePresence>
    </ProfessionalLayout>
  );
}

function SearchIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}
