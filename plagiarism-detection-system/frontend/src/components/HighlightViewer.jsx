import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertTriangle, X } from "lucide-react";

export default function HighlightViewer({ data, onClose }) {
  const [mobileTab, setMobileTab] = useState("source");
  if (!data) return null;

  const { source_sentences, corpus_sentences, highlighted_source, highlighted_corpus, matches, corpus_filename } = data;

  const getSourceColor = (i) => {
    if (!highlighted_source.includes(i)) return "text-gray-500 text-xs";
    const m = matches.find((m) => m.source_index === i);
    if (!m) return "text-gray-500 text-xs";
    if (m.score >= 70) return "bg-red-500/15 border-l-2 border-red-500 text-red-200 text-xs";
    if (m.score >= 40) return "bg-orange-500/15 border-l-2 border-orange-500 text-orange-200 text-xs";
    return "bg-yellow-500/15 border-l-2 border-yellow-500 text-yellow-200 text-xs";
  };

  const getCorpusColor = (i) => {
    if (!highlighted_corpus.includes(i)) return "text-gray-500 text-xs";
    return "bg-purple-500/15 border-l-2 border-purple-500 text-purple-200 text-xs";
  };

  // Only show flagged + a few surrounding sentences to keep it compact
  const compactSource = source_sentences
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => highlighted_source.includes(i) || 
      highlighted_source.some(h => Math.abs(h - i) <= 1));

  const compactCorpus = corpus_sentences
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => highlighted_corpus.includes(i) ||
      highlighted_corpus.some(h => Math.abs(h - i) <= 1));

  const displaySource = compactSource.length > 0 ? compactSource : source_sentences.slice(0, 8).map((s, i) => ({ s, i }));
  const displayCorpus = compactCorpus.length > 0 ? compactCorpus : corpus_sentences.slice(0, 8).map((s, i) => ({ s, i }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-5xl flex flex-col rounded-t-2xl sm:rounded-2xl"
        style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <FileText size={13} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-xs sm:text-sm">Sentence-Level Match Analysis</p>
              <p className="text-gray-500 text-xs truncate max-w-[200px] sm:max-w-none">vs {corpus_filename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats bar — compact, single line, no overflow */}
        <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-5 py-2 border-b border-white/5 bg-white/2 shrink-0 flex-wrap">
          <span className="text-gray-400 text-xs">Matches: <span className="text-white font-semibold">{matches.length}</span></span>
          <span className="text-gray-400 text-xs">Source: <span className="text-white font-semibold">{source_sentences.length}</span> sentences</span>
          <span className="text-gray-400 text-xs">Corpus: <span className="text-white font-semibold">{corpus_sentences.length}</span> sentences</span>
          {matches.length > 0 && (
            <span className="flex items-center gap-1 text-orange-400 text-xs">
              <AlertTriangle size={11} />
              {highlighted_source.length} flagged
            </span>
          )}
        </div>

        {/* Legend — compact single row */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-2 border-b border-white/5 shrink-0">
          {[
            { color: "bg-red-500/40 border-red-500",    label: "High"     },
            { color: "bg-orange-500/40 border-orange-500", label: "Moderate" },
            { color: "bg-purple-500/40 border-purple-500", label: "Corpus"   },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1 text-xs text-gray-400">
              <span className={`w-2.5 h-2.5 rounded-sm border inline-block ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Mobile tab switcher */}
        <div className="flex sm:hidden border-b border-white/5 shrink-0">
          {[
            { id: "source", label: "Submitted Doc" },
            { id: "corpus", label: "Corpus Doc"    },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                mobileTab === id
                  ? id === "source"
                    ? "text-indigo-400 border-b-2 border-indigo-500"
                    : "text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content — fixed height so panels can scroll vertically */}
        <div className="min-h-0" style={{ height: "380px" }}>

          {/* Desktop: side by side */}
          <div className="hidden sm:grid grid-cols-2 divide-x divide-white/5" style={{ height: "380px" }}>
            <Panel label="Submitted Document" items={displaySource} getColor={getSourceColor} matches={matches} isSource />
            <Panel label="Corpus Document"    items={displayCorpus} getColor={getCorpusColor} matches={[]}    />
          </div>

          {/* Mobile: tab based */}
          <div className="sm:hidden" style={{ height: "380px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full overflow-hidden"
              >
                {mobileTab === "source"
                  ? <Panel label="Submitted Document" items={displaySource} getColor={getSourceColor} matches={matches} isSource mobile />
                  : <Panel label="Corpus Document"    items={displayCorpus} getColor={getCorpusColor} matches={[]}    mobile />
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Panel({ label, items, getColor, matches, isSource = false, mobile = false }) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      {!mobile && (
        <div className="px-4 py-2 bg-white/2 border-b border-white/5 shrink-0">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        </div>
      )}
      {/* No scrollbar — hidden scrollbar class */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        {items.map(({ s, i }) => {
          const colorClass = getColor(i);
          const score = isSource ? matches.find((m) => m.source_index === i)?.score : null;
          return (
            <div
              key={i}
              className={`px-2.5 py-1.5 rounded-lg leading-snug transition-all ${colorClass}`}
            >
              <span className="text-xs leading-relaxed">{s}</span>
              {score != null && (
                <span className="ml-1.5 text-xs opacity-70 font-semibold">{score}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
