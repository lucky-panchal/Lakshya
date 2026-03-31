import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, History, Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Check", icon: Search },
  { to: "/corpus", label: "Corpus", icon: Database },
  { to: "/results", label: "History", icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)" }}>
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">

          {/* Left — Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-blue overflow-hidden">
              <img src={require('../img/social_pfp.png')} alt="logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-white font-bold text-base sm:text-lg tracking-tight">Lakshya</span>
              <span className="gradient-text font-bold text-base sm:text-lg tracking-tight">AI</span>
            </div>
          </Link>

          {/* Center — Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-600/30 text-indigo-300 shadow-lg shadow-indigo-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                    {active && (
                      <motion.div layoutId="activeTab" className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right — Status + Avatar + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
              <span className="text-gray-400 text-xs font-medium">API Live</span>
            </div>
            {/* Mobile: just the dot */}
            <div className="flex sm:hidden items-center gap-1.5 px-2 py-1 rounded-full glass">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              L
            </div>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-3 pb-2 space-y-1 border-t border-white/5 mt-3">
                {links.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to;
                  return (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}>
                        <Icon size={16} />
                        {label}
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
