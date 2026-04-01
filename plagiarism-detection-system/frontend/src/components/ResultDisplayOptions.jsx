import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, List, AlertTriangle, CheckCircle, Info, FileText, TrendingUp, Target, Zap } from "lucide-react";
import { ProfessionalBadge } from "./ProfessionalLayout";

const DISPLAY_MODES = [
  { id: "summary",  label: "Summary",   icon: Zap,      description: "Essential info at a glance"    },
  { id: "detailed", label: "Detailed",  icon: List,     description: "Complete analysis breakdown"   },
  { id: "visual",   label: "Visual",    icon: BarChart3, description: "Charts and visual insights"   },
];

export default function ResultDisplayOptions({ result, onModeChange, currentMode = "summary" }) {
  const [selectedMode, setSelectedMode] = useState(currentMode);

  const handleModeChange = (mode) => { setSelectedMode(mode); onModeChange(mode); };

  const getRisk = (score) => {
    if (score >= 70) return { level: "High Risk",   color: "text-red-400",    bg: "bg-red-500/10",    icon: AlertTriangle };
    if (score >= 40) return { level: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/10", icon: Info          };
    return               { level: "Low Risk",    color: "text-green-400",  bg: "bg-green-500/10",  icon: CheckCircle   };
  };

  const risk = getRisk(result.top_similarity);

  return (
    <div className="space-y-4">
      {/* Mode Selector — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Result Display</h3>
          <p className="text-gray-500 text-xs">Choose how you want to view the results</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 self-start sm:self-auto">
          {DISPLAY_MODES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => handleModeChange(id)}
              title={description}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedMode === id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={12} />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selectedMode === "summary"  && <SummaryView  result={result} risk={risk} />}
          {selectedMode === "detailed" && <DetailedView result={result} risk={risk} />}
          {selectedMode === "visual"   && <VisualView   result={result} risk={risk} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── SUMMARY VIEW ─────────────────────────────────────────────────
function SummaryView({ result, risk }) {
  const RiskIcon = risk.icon;
  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h4 className="text-white font-semibold text-sm sm:text-base">Analysis Complete</h4>
          <p className="text-gray-500 text-xs truncate">{result.document}</p>
        </div>
        <ProfessionalBadge variant={result.top_similarity >= 70 ? "error" : result.top_similarity >= 40 ? "warning" : "success"}>
          <RiskIcon size={12} className="mr-1" />
          {risk.level}
        </ProfessionalBadge>
      </div>

      {/* Stats — 3 cols always, smaller text on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        {[
          { value: `${result.top_similarity}%`, label: "Similarity",  color: risk.color       },
          { value: result.matches.length,        label: "Sources",     color: "text-indigo-400" },
          { value: result.mode.toUpperCase(),    label: "Mode",        color: "text-purple-400" },
        ].map(({ value, label, color }) => (
          <div key={label} className="text-center bg-white/3 rounded-xl py-3 px-2">
            <div className={`text-lg sm:text-2xl font-bold ${color} mb-0.5`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {result.top_match && (
        <div className="bg-white/5 rounded-xl p-3 sm:p-4">
          <p className="text-gray-400 text-xs mb-1">Top Match</p>
          <p className="text-white text-sm font-medium truncate">{result.top_match}</p>
        </div>
      )}
    </div>
  );
}

// ── DETAILED VIEW ────────────────────────────────────────────────
function DetailedView({ result, risk }) {
  const RiskIcon = risk.icon;
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${risk.bg} flex items-center justify-center shrink-0`}>
            <RiskIcon size={18} className={risk.color} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{result.document}</h4>
            <p className="text-gray-500 text-xs">Detailed Analysis Report</p>
          </div>
        </div>

        {/* Two columns on sm+, single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h5 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Detection Results</h5>
            <div className="space-y-2.5">
              {[
                { label: "Similarity Score", value: `${result.top_similarity}%`, color: risk.color       },
                { label: "Risk Level",        value: risk.level,                  color: risk.color       },
                { label: "Detection Mode",    value: result.mode.toUpperCase(),   color: "text-white"     },
                { label: "Sources Matched",   value: result.matches.length,       color: "text-indigo-400"},
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm shrink-0">{label}</span>
                  <span className={`font-bold text-xs sm:text-sm ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
            <h5 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Document Info</h5>
            <div className="space-y-2.5">
              {[
                { label: "File Name",      value: result.document,           color: "text-white"     },
                { label: "Top Match",      value: result.top_match || "None", color: "text-purple-400"},
                { label: "Analysis Date",  value: new Date().toLocaleDateString(), color: "text-gray-400"},
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm shrink-0">{label}</span>
                  <span className={`text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[140px] text-right ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matches list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
          <h5 className="text-white font-semibold text-sm">Source Matches Breakdown</h5>
        </div>
        <div className="divide-y divide-white/5 max-h-56 sm:max-h-64 overflow-y-auto">
          {result.matches.map((match, i) => {
            const c = match.similarity >= 70 ? "text-red-400" : match.similarity >= 40 ? "text-orange-400" : "text-green-400";
            const bg = match.similarity >= 70 ? "bg-red-500/20" : match.similarity >= 40 ? "bg-orange-500/20" : "bg-green-500/20";
            const v = match.similarity >= 70 ? "error" : match.similarity >= 40 ? "warning" : "success";
            return (
              <div key={i} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                    <FileText size={13} className={c} />
                  </div>
                  <span className="text-gray-300 text-xs sm:text-sm truncate">{match.filename}</span>
                </div>
                <ProfessionalBadge variant={v} size="small">{match.similarity}%</ProfessionalBadge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── VISUAL VIEW ──────────────────────────────────────────────────
function VisualView({ result, risk }) {
  const RiskIcon = risk.icon;
  const highRisk   = result.matches.filter(m => m.similarity >= 70).length;
  const mediumRisk = result.matches.filter(m => m.similarity >= 40 && m.similarity < 70).length;
  const lowRisk    = result.matches.filter(m => m.similarity < 40).length;

  return (
    <div className="space-y-4">
      {/* Score + Distribution — stacks on mobile */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h4 className="text-white font-semibold text-sm sm:text-base mb-4 sm:mb-6">Similarity Dashboard</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={result.top_similarity >= 70 ? "#ef4444" : result.top_similarity >= 40 ? "#f97316" : "#22c55e"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.top_similarity / 100) * 314} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl font-bold ${risk.color}`}>{result.top_similarity}%</div>
                  <div className="text-xs text-gray-500">Similarity</div>
                </div>
              </div>
            </div>
            <ProfessionalBadge variant={result.top_similarity >= 70 ? "error" : result.top_similarity >= 40 ? "warning" : "success"}>
              <RiskIcon size={12} className="mr-1" />{risk.level}
            </ProfessionalBadge>
          </div>

          {/* Distribution */}
          <div className="border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
            <h5 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Risk Distribution</h5>
            <div className="space-y-3">
              {[
                { dot: "bg-red-500",    label: "High Risk (70%+)",    value: highRisk,   color: "text-red-400"    },
                { dot: "bg-orange-500", label: "Medium (40–69%)",     value: mediumRisk, color: "text-orange-400" },
                { dot: "bg-green-500",  label: "Low Risk (0–39%)",    value: lowRisk,    color: "text-green-400"  },
              ].map(({ dot, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                    <span className="text-xs sm:text-sm text-gray-300">{label}</span>
                  </div>
                  <span className={`font-semibold text-sm ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sources", value: result.matches.length,     icon: FileText,  color: "text-blue-400"   },
          { label: "Top Score",     value: `${result.top_similarity}%`, icon: TrendingUp, color: risk.color      },
          { label: "Detection",     value: result.mode.toUpperCase(), icon: Target,    color: "text-purple-400" },
          { label: "Risk Level",    value: risk.level.split(" ")[0],  icon: RiskIcon,  color: risk.color        },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-3 sm:p-4 text-center">
            <Icon size={18} className={`${color} mx-auto mb-1.5`} />
            <div className={`text-base sm:text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h5 className="text-white font-semibold text-sm mb-4">Top Similarity Matches</h5>
        <div className="space-y-3">
          {result.matches.slice(0, 5).map((match, i) => {
            const c = match.similarity >= 70 ? "bg-red-500" : match.similarity >= 40 ? "bg-orange-500" : "bg-green-500";
            const t = match.similarity >= 70 ? "text-red-400" : match.similarity >= 40 ? "text-orange-400" : "text-green-400";
            return (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className="w-6 text-gray-500 text-xs shrink-0">#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 truncate mb-1">{match.filename}</div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2">
                    <div className={`h-full rounded-full transition-all duration-1000 ${c}`} style={{ width: `${match.similarity}%` }} />
                  </div>
                </div>
                <div className={`text-xs sm:text-sm font-bold shrink-0 ${t}`}>{match.similarity}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
