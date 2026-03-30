import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Database, History } from "lucide-react";

const links = [
  { to: "/", label: "Check", icon: Search },
  { to: "/corpus", label: "Corpus", icon: Database },
  { to: "/results", label: "History", icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(10,15,30,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-none mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center max-w-7xl mx-auto">
          {/* Left - Logo & Brand */}
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-blue overflow-hidden">
                <img src={require('../img/social_pfp.png')} alt="logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">Lakshya</span>
                <span className="gradient-text font-bold text-lg tracking-tight">AI</span>
              </div>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
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
                        <motion.div
                          layoutId="activeTab"
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right - Status & Actions */}
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
              <span className="text-gray-400 text-xs font-medium">API Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
