import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  PieChart, 
  List, 
  Grid3X3, 
  Eye, 
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { ProfessionalSection, ProfessionalButton, ProfessionalBadge } from "./ProfessionalLayout";

const DISPLAY_MODES = [
  {
    id: "summary",
    label: "Quick Summary",
    icon: Zap,
    description: "Essential info at a glance"
  },
  {
    id: "detailed",
    label: "Detailed View", 
    icon: List,
    description: "Complete analysis breakdown"
  },
  {
    id: "visual",
    label: "Visual Dashboard",
    icon: BarChart3,
    description: "Charts and visual insights"
  }
];

export default function ResultDisplayOptions({ result, onModeChange, currentMode = "summary" }) {
  const [selectedMode, setSelectedMode] = useState(currentMode);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: "High Risk", color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle };
    if (score >= 40) return { level: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/10", icon: Info };
    return { level: "Low Risk", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle };
  };

  const risk = getRiskLevel(result.top_similarity);
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-4">
      {/* Display Mode Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-sm">Result Display</h3>
          <p className="text-gray-500 text-xs">Choose how you want to view the results</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {DISPLAY_MODES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => handleModeChange(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedMode === id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title={description}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display Based on Selected Mode */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selectedMode === "summary" && <SummaryView result={result} risk={risk} />}
          {selectedMode === "detailed" && <DetailedView result={result} risk={risk} />}
          {selectedMode === "visual" && <VisualView result={result} risk={risk} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Quick Summary View
function SummaryView({ result, risk }) {
  const RiskIcon = risk.icon;
  
  return (
    <div className="glass rounded-2xl p-6">
      <ProfessionalSection alignment="between" className="mb-4">
        <div>
          <h4 className="text-white font-semibold">Analysis Complete</h4>
          <p className="text-gray-500 text-sm">{result.document}</p>
        </div>
        <ProfessionalBadge variant={result.top_similarity >= 70 ? "error" : result.top_similarity >= 40 ? "warning" : "success"}>
          <RiskIcon size={12} className="mr-1" />
          {risk.level}
        </ProfessionalBadge>
      </ProfessionalSection>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">{result.top_similarity}%</div>
          <div className="text-xs text-gray-500">Similarity Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400 mb-1">{result.matches.length}</div>
          <div className="text-xs text-gray-500">Sources Found</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">{result.mode.toUpperCase()}</div>
          <div className="text-xs text-gray-500">Detection Mode</div>
        </div>
      </div>

      {result.top_match && (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Top Match</p>
          <p className="text-white text-sm font-medium">{result.top_match}</p>
        </div>
      )}
    </div>
  );
}

// Detailed View
function DetailedView({ result, risk }) {
  const RiskIcon = risk.icon;
  
  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="glass rounded-2xl p-6">
        <ProfessionalSection spacing="tight" className="mb-4">
          <div className={`w-12 h-12 rounded-xl ${risk.bg} flex items-center justify-center`}>
            <RiskIcon size={20} className={risk.color} />
          </div>
          <div>
            <h4 className="text-white font-semibold">{result.document}</h4>
            <p className="text-gray-500 text-sm">Detailed Analysis Report</p>
          </div>
        </ProfessionalSection>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Detection Results</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Similarity Score</span>
                <span className={`font-bold ${risk.color}`}>{result.top_similarity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Risk Level</span>
                <span className={risk.color}>{risk.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Detection Mode</span>
                <span className="text-white">{result.mode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Sources Matched</span>
                <span className="text-indigo-400">{result.matches.length}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Document Info</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">File Name</span>
                <span className="text-white text-sm truncate max-w-32">{result.document}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Top Match</span>
                <span className="text-purple-400 text-sm truncate max-w-32">{result.top_match || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Analysis Date</span>
                <span className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Breakdown */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h5 className="text-white font-semibold">Source Matches Breakdown</h5>
        </div>
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {result.matches.map((match, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  match.similarity >= 70 ? "bg-red-500/20" : 
                  match.similarity >= 40 ? "bg-orange-500/20" : "bg-green-500/20"
                }`}>
                  <FileText size={14} className={
                    match.similarity >= 70 ? "text-red-400" : 
                    match.similarity >= 40 ? "text-orange-400" : "text-green-400"
                  } />
                </div>
                <span className="text-gray-300 text-sm">{match.filename}</span>
              </div>
              <ProfessionalBadge 
                variant={match.similarity >= 70 ? "error" : match.similarity >= 40 ? "warning" : "success"}
                size="small"
              >
                {match.similarity}%
              </ProfessionalBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Visual Dashboard View
function VisualView({ result, risk }) {
  const RiskIcon = risk.icon;
  
  // Calculate distribution
  const highRisk = result.matches.filter(m => m.similarity >= 70).length;
  const mediumRisk = result.matches.filter(m => m.similarity >= 40 && m.similarity < 70).length;
  const lowRisk = result.matches.filter(m => m.similarity < 40).length;
  
  return (
    <div className="space-y-6">
      {/* Score Visualization */}
      <div className="glass rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-6">Similarity Analysis Dashboard</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Gauge */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke={result.top_similarity >= 70 ? "#ef4444" : result.top_similarity >= 40 ? "#f97316" : "#22c55e"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.top_similarity / 100) * 314} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${risk.color}`}>{result.top_similarity}%</div>
                  <div className="text-xs text-gray-500">Similarity</div>
                </div>
              </div>
            </div>
            <ProfessionalBadge variant={result.top_similarity >= 70 ? "error" : result.top_similarity >= 40 ? "warning" : "success"}>
              <RiskIcon size={12} className="mr-1" />
              {risk.level}
            </ProfessionalBadge>
          </div>

          {/* Risk Distribution */}
          <div>
            <h5 className="text-gray-400 text-sm font-semibold mb-4">Risk Distribution</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-300">High Risk (70%+)</span>
                </div>
                <span className="text-red-400 font-semibold">{highRisk}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-300">Medium Risk (40-69%)</span>
                </div>
                <span className="text-orange-400 font-semibold">{mediumRisk}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-300">Low Risk (0-39%)</span>
                </div>
                <span className="text-green-400 font-semibold">{lowRisk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sources", value: result.matches.length, icon: FileText, color: "text-blue-400" },
          { label: "Top Score", value: `${result.top_similarity}%`, icon: TrendingUp, color: risk.color },
          { label: "Detection", value: result.mode.toUpperCase(), icon: Target, color: "text-purple-400" },
          { label: "Risk Level", value: risk.level.split(" ")[0], icon: RiskIcon, color: risk.color },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Top Matches Visual */}
      <div className="glass rounded-2xl p-6">
        <h5 className="text-white font-semibold mb-4">Top Similarity Matches</h5>
        <div className="space-y-3">
          {result.matches.slice(0, 5).map((match, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 text-gray-500 text-sm">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-300 truncate">{match.filename}</div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      match.similarity >= 70 ? "bg-red-500" : 
                      match.similarity >= 40 ? "bg-orange-500" : "bg-green-500"
                    }`}
                    style={{ width: `${match.similarity}%` }}
                  ></div>
                </div>
              </div>
              <div className={`text-sm font-bold ${
                match.similarity >= 70 ? "text-red-400" : 
                match.similarity >= 40 ? "text-orange-400" : "text-green-400"
              }`}>
                {match.similarity}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}