import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Globe, Calendar, AlignLeft } from "lucide-react";

export default function CorpusPreview({ doc, onClose }) {
  if (!doc) return null;

  const content    = doc.content || "";
  const wordCount  = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount  = content.length;
  const sentences  = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const preview    = content.slice(0, 1200);
  const isTruncated = content.length > 1200;

  return (
    <AnimatePresence>
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
          className="w-full sm:max-w-2xl flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
          style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "85vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                doc.source_type === "url" ? "bg-purple-500/20" : "bg-blue-500/20"
              }`}>
                {doc.source_type === "url"
                  ? <Globe size={14} className="text-purple-400" />
                  : <FileText size={14} className="text-blue-400" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{doc.filename}</p>
                <p className="text-gray-500 text-xs capitalize">{doc.source_type} document</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
            >
              <X size={14} />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-5 py-2.5 border-b border-white/5 bg-white/2 shrink-0 flex-wrap">
            {[
              { icon: AlignLeft,  label: "Words",     value: wordCount.toLocaleString()  },
              { icon: AlignLeft,  label: "Characters", value: charCount.toLocaleString()  },
              { icon: AlignLeft,  label: "Sentences",  value: sentences.toLocaleString()  },
              { icon: Calendar,   label: "Added",      value: doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "—"
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-gray-500 text-xs">{label}: </span>
                <span className="text-white text-xs font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {/* Content preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-hide">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Content Preview
            </p>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {preview}
            </p>
            {isTruncated && (
              <p className="text-indigo-400 text-xs mt-4 italic">
                ... content truncated for preview. Full document stored in corpus.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
