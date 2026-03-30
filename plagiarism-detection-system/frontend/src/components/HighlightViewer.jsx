import { motion } from "framer-motion";
import { FileText, AlertTriangle } from "lucide-react";

export default function HighlightViewer({ data, onClose }) {
  if (!data) return null;

  const { source_sentences, corpus_sentences, highlighted_source, highlighted_corpus, matches, corpus_filename } = data;

  const getSourceColor = (index) => {
    if (!highlighted_source.includes(index)) return "";
    const match = matches.find((m) => m.source_index === index);
    if (!match) return "";
    if (match.score >= 70) return "bg-red-500/20 border-l-2 border-red-500 text-red-200";
    if (match.score >= 40) return "bg-orange-500/20 border-l-2 border-orange-500 text-orange-200";
    return "bg-yellow-500/20 border-l-2 border-yellow-500 text-yellow-200";
  };

  const getCorpusColor = (index) => {
    if (!highlighted_corpus.includes(index)) return "";
    return "bg-purple-500/20 border-l-2 border-purple-500 text-purple-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileText size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Sentence-Level Match Analysis</p>
              <p className="text-gray-500 text-xs">Compared against: {corpus_filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500 inline-block" /> High match</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500/40 border border-orange-500 inline-block" /> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500/40 border border-purple-500 inline-block" /> Corpus match</span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-white/5 bg-white/2">
          <span className="text-gray-400 text-xs">Total matches: <span className="text-white font-semibold">{matches.length}</span></span>
          <span className="text-gray-400 text-xs">Source sentences: <span className="text-white font-semibold">{source_sentences.length}</span></span>
          <span className="text-gray-400 text-xs">Corpus sentences: <span className="text-white font-semibold">{corpus_sentences.length}</span></span>
          {matches.length > 0 && (
            <span className="flex items-center gap-1.5 text-orange-400 text-xs">
              <AlertTriangle size={12} />
              {highlighted_source.length} of {source_sentences.length} sentences flagged
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-white/5">
          {/* Source */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-white/2 border-b border-white/5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Submitted Document</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {source_sentences.map((sent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`px-3 py-2 rounded-lg text-sm leading-relaxed transition-all ${
                    getSourceColor(i) || "text-gray-400"
                  }`}
                >
                  {sent}
                  {highlighted_source.includes(i) && (
                    <span className="ml-2 text-xs opacity-60">
                      {matches.find((m) => m.source_index === i)?.score}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Corpus */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-white/2 border-b border-white/5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Corpus Document</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {corpus_sentences.map((sent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`px-3 py-2 rounded-lg text-sm leading-relaxed transition-all ${
                    getCorpusColor(i) || "text-gray-400"
                  }`}
                >
                  {sent}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
