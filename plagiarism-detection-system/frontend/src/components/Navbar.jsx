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
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-blue overflow-hidden">
            <img src={require('../img/social_pfp.png')} alt="logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Lakshya</span>
            <span className="gradient-text font-bold text-lg tracking-tight">AI</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
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

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
          <span className="text-gray-400 text-xs font-medium">API Live</span>
        </div>
      </div>
    </nav>
  );
}
