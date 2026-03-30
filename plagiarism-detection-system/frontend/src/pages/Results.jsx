import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getResults, deleteResult, clearAllResults } from "../api";
import ProfessionalLayout, { 
  ProfessionalHeader, 
  ProfessionalSection, 
  ProfessionalCard, 
  ProfessionalButton, 
  ProfessionalGrid,
  ProfessionalBadge 
} from "../components/ProfessionalLayout";
import { AlertTriangle, CheckCircle, Info, History, TrendingUp, Trash2, Trash, BarChart3 } from "lucide-react";

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
    <ProfessionalLayout fullWidth>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      {/* Professional Header */}
      <ProfessionalHeader
        title={<>Check <span className="gradient-text">History</span></>}
        subtitle="All previous plagiarism checks and their results."
        rightContent={
          results.length > 0 && (
            <ProfessionalButton
              variant={confirmClear ? "primary" : "secondary"}
              size="normal"
              onClick={handleClearAll}
              className={confirmClear ? "bg-red-500/20 border-red-500/40 text-red-400" : "hover:text-red-400 hover:border-red-500/30"}
            >
              <Trash size={14} className="mr-2" />
              {confirmClear ? "Confirm Clear All?" : "Clear History"}
            </ProfessionalButton>
          )
        }
      />

      {/* Professional Stats Section */}
      {results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ProfessionalGrid cols="3" gap="normal">
            {[
              { 
                label: "Total Checks", 
                value: results.length, 
                icon: History, 
                variant: "info",
                gradient: "from-pink-500 to-rose-500"
              },
              { 
                label: "Avg Similarity", 
                value: `${avg}%`, 
                icon: TrendingUp, 
                variant: "warning",
                gradient: "from-orange-500 to-red-500"
              },
              { 
                label: "High Risk", 
                value: highRisk, 
                icon: AlertTriangle, 
                variant: "error",
                gradient: "from-red-500 to-pink-500"
              },
            ].map(({ label, value, icon: Icon, variant, gradient }) => (
              <ProfessionalCard key={label} className={`border-t-2 bg-gradient-to-br ${gradient} bg-opacity-5`}>
                <ProfessionalSection spacing="tight">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 flex items-center justify-center shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                  </div>
                </ProfessionalSection>
              </ProfessionalCard>
            ))}
          </ProfessionalGrid>
        </motion.div>
      )}

      {/* Professional Results List */}
      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ProfessionalCard className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <History size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium text-sm">No checks yet</p>
            <p className="text-gray-600 text-xs mt-1">Run a plagiarism check to see results here</p>
            <ProfessionalButton variant="primary" size="normal" className="mt-4">
              <BarChart3 size={14} className="mr-2" />
              Start Checking
            </ProfessionalButton>
          </ProfessionalCard>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {results.map((r, i) => {
              const risk = getRisk(r.score);
              const Icon = risk.icon;
              const variant = r.score >= 70 ? "error" : r.score >= 40 ? "warning" : "success";
              
              return (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProfessionalCard hover className="group">
                    <ProfessionalSection alignment="between">
                      <ProfessionalSection spacing="tight" className="min-w-0 flex-1">
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
                      </ProfessionalSection>
                      
                      <ProfessionalSection spacing="tight" className="shrink-0">
                        <div className="text-right">
                          <ProfessionalBadge variant={variant} size="normal" className="font-bold">
                            {r.score}%
                          </ProfessionalBadge>
                          <p className={`text-xs mt-1 ${risk.color}`}>{risk.label}</p>
                        </div>
                        
                        <motion.button
                          onClick={() => handleDelete(r.id)}
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </ProfessionalSection>
                    </ProfessionalSection>
                  </ProfessionalCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </ProfessionalLayout>
  );
}
