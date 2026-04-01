import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Search, Database, History, AlertTriangle } from "lucide-react";

const links = [
  { to: "/",        label: "Check Documents", icon: Search,   desc: "Run a plagiarism check"     },
  { to: "/corpus",  label: "Manage Corpus",   icon: Database, desc: "Upload reference documents" },
  { to: "/results", label: "View History",    icon: History,  desc: "See past check results"     },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-full bg-indigo-500/10"
          />
          <div className="relative w-20 h-20 rounded-2xl glass border border-white/10 flex items-center justify-center">
            <AlertTriangle size={28} className="text-indigo-400" />
          </div>
        </div>

        {/* Error code */}
        <h1 className="text-7xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-white text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {links.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ y: -2 }}
                className="glass rounded-xl p-4 text-left border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <Icon size={16} className="text-indigo-400 mb-2" />
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Home button */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-primary"
          >
            <Home size={15} />
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
