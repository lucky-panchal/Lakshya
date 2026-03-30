import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getResults, deleteResult, clearAllResults } from "../api";
import { AlertTriangle, CheckCircle, Info, History, TrendingUp, Trash2, Trash } from "lucide-react";

const getRisk = (s) => {
  if (s >= 70) return { label: "High Risk", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle };
  if (s >= 40) return { label: "Moderate", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: Info };
  return { label: "Low Risk", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: CheckCircle };
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchResults = () => getResults().then((res) => setResults(res.data));

  useEffect(() => { fetchResults(); }, []);

  const handleDelete = async (id) => {
    await deleteResult(id);
    toast.success("Result removed");
    fetchResults();
  };

  const handleClearAll = async () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    await clearAllResults();
    toast.success("History cleared");
    setResults([]);
    setConfirmClear(false);
  };

  const avg = results.length ? (results.reduce((a, r) => a + r.score, 0) / results.length).toFixed(1) : 0;
  const highRisk = results.filter((r) => r.score >= 70).length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Check <span className="gradient-text">History</span>
          </h1>
          <p className="text-gray-500">All previous plagiarism checks and their results.</p>
        </div>

        {results.length > 0 && (
          <motion.button
            onClick={handleClearAll}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              confirmClear
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "glass border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30"
            }`}
          >
            <Trash size={14} />
            {confirmClear ? "Confirm Clear All?" : "Clear History"}
          </motion.button>
        )}
      </motion.div>

      {/* Stats Row */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Checks", value: results.length, icon: History, color: "text-pink-400", bg: "bg-pink-500/10" },
            { label: "Avg Similarity", value: `${avg}%`, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/10" },
            { label: "High Risk", value: highRisk, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <History size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-500">No checks yet</p>
          <p className="text-gray-600 text-sm mt-1">Run a plagiarism check to see results here</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {results.map((r, i) => {
              const risk = getRisk(r.score);
              const Icon = risk.icon;
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, x: 0, opacity: 1 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl px-6 py-5 flex items-center justify-between card-hover group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${risk.bg}`}>
                      <Icon size={18} className={risk.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{r.filename}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Top match: <span className="text-gray-400">{r.matched_source || "None"}</span>
                        <span className="mx-2">·</span>
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${risk.bg} ${risk.color}`}>
                        {r.score}%
                      </div>
                      <p className={`text-xs mt-1 ${risk.color}`}>{risk.label}</p>
                    </div>
                    <motion.button
                      onClick={() => handleDelete(r.id)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all">
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
