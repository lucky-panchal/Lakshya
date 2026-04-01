import { motion } from "framer-motion";
import profileImg from "../img/social_pfp.png";
import { Code2, ExternalLink, Globe } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-white/5 mt-12 sm:mt-16"
      style={{ background: "rgba(10,15,30,0.95)" }}
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">

        {/* Main footer row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 sm:gap-4">

          {/* Left — Copyright */}
          <div className="flex items-center gap-2 order-3 sm:order-1">
            <span className="text-gray-600 text-sm">© 2026</span>
            <span className="text-white font-semibold text-sm">Lakshya<span className="gradient-text">AI</span></span>
            <span className="text-gray-600 text-sm hidden sm:inline">· All rights reserved</span>
          </div>

          {/* Center — Creator */}
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-full order-1 sm:order-2">
            <img src={profileImg} alt="Lacki Lohar" className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40" />
            <span className="text-gray-400 text-sm">
              Crafted by <span className="text-white font-semibold">Lacki Lohar</span>
            </span>
          </div>

          {/* Right — Social links */}
          <div className="flex items-center gap-2 order-2 sm:order-3">
            <a href="https://github.com/lucky-panchal" target="_blank" rel="noreferrer" title="GitHub"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white hover:bg-indigo-500/20 transition-all duration-200">
              <Code2 size={16} />
            </a>
            <a href="https://in.linkedin.com/in/lacki-lohar-463a23321" target="_blank" rel="noreferrer" title="LinkedIn"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-500/20 transition-all duration-200">
              <ExternalLink size={16} />
            </a>
            <a href="https://lackilohar.netlify.app" target="_blank" rel="noreferrer" title="Portfolio"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white hover:bg-purple-500/20 transition-all duration-200">
              <Globe size={16} />
            </a>
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
            <div className="text-xs text-gray-500 hidden sm:block">
              <span className="block">Plagiarism Detection</span>
              <span className="text-indigo-400">System v2.0</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-5 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <span>Built with React & FastAPI</span>
            <span>Powered by AI Technology</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
