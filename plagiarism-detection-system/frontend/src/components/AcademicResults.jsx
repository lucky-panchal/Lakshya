import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, Users, Calendar, Database, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ProfessionalBadge, ProfessionalSection } from "./ProfessionalLayout";

const SOURCE_COLORS = {
  "Semantic Scholar": { bg: "bg-blue-500/15",   text: "text-blue-400",   border: "border-blue-500/20"   },
  "CrossRef":         { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/20" },
  "arXiv":            { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
};

export default function AcademicResults({ data, loading }) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 mt-6">
        <ProfessionalSection spacing="tight" className="mb-4">
          <BookOpen size={18} className="text-indigo-400" />
          <h3 className="text-white font-semibold">Academic Database Search</h3>
        </ProfessionalSection>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { academic_matches, academic_top_score, academic_sources_count, databases_searched } = data;
  const displayMatches = showAll ? academic_matches : academic_matches.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden mt-6"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <ProfessionalSection spacing="tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <BookOpen size={15} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Academic Database Results</h3>
            <p className="text-gray-500 text-xs">
              {databases_searched?.join(" · ")} · {academic_sources_count} matches found
            </p>
          </div>
        </ProfessionalSection>

        <ProfessionalSection spacing="tight">
          {academic_top_score > 0 && (
            <ProfessionalBadge
              variant={academic_top_score >= 70 ? "error" : academic_top_score >= 40 ? "warning" : "success"}
              size="normal"
            >
              Top: {academic_top_score}%
            </ProfessionalBadge>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </ProfessionalSection>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {academic_matches.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Database size={24} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No academic matches found</p>
                <p className="text-gray-600 text-xs mt-1">Content appears original in academic databases</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {displayMatches.map((match, i) => {
                  const sourceStyle = SOURCE_COLORS[match.source] || SOURCE_COLORS["Semantic Scholar"];
                  const variant = match.similarity >= 70 ? "error" : match.similarity >= 40 ? "warning" : "success";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 sm:px-6 py-4 hover:bg-white/2 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          {/* Source badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
                            {match.source}
                          </span>
                          {/* Title */}
                          <p className="text-white text-sm font-medium leading-snug">{match.title}</p>
                        </div>
                        <ProfessionalBadge variant={variant} size="small" className="shrink-0">
                          {match.similarity}%
                        </ProfessionalBadge>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 flex-wrap ml-0 sm:ml-16 mb-2">
                        {match.authors && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Users size={11} />
                            {match.authors}
                          </span>
                        )}
                        {match.year && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={11} />
                            {match.year}
                          </span>
                        )}
                        {match.venue && (
                          <span className="text-xs text-gray-500 italic">{match.venue}</span>
                        )}
                      </div>

                      {/* Abstract preview */}
                      {match.abstract && (
                        <p className="text-gray-500 text-xs leading-relaxed ml-0 sm:ml-16 mb-2 line-clamp-2">
                          {match.abstract}
                        </p>
                      )}

                      {/* Links */}
                      <div className="flex items-center gap-3 ml-0 sm:ml-16">
                        {match.url && (
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <ExternalLink size={11} />
                            View Paper
                          </a>
                        )}
                        {match.doi && (
                          <span className="text-xs text-gray-600">
                            DOI: {match.doi}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {academic_matches.length > 4 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-white/5">
                    <span className="text-gray-600 text-xs">
                      {academic_matches.length - 4} more matches
                    </span>
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="text-indigo-400 text-xs hover:text-indigo-300 font-medium transition-colors"
                    >
                      {showAll ? "Show less ↑" : `Show all ${academic_matches.length} →`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
