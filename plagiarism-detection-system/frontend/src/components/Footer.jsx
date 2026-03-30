import { motion } from "framer-motion";
import profileImg from "../img/social_pfp.png";
import { Code2, ExternalLink, Globe } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-white/5 mt-16 py-8"
      style={{ background: "rgba(10,15,30,0.95)" }}
    >
      <div className="max-w-none mx-auto px-4">
        <div className="grid grid-cols-3 items-center py-8 max-w-7xl mx-auto">
          {/* Left - Copyright & Legal */}
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">© 2026</span>
              <span className="text-white font-semibold text-sm">Lakshya<span className="gradient-text">AI</span></span>
              <span className="text-gray-600 text-sm hidden sm:inline">· All rights reserved</span>
            </div>
          </div>

          {/* Center - Creator Attribution */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
              <img
                src={profileImg}
                alt="Lacki Lohar"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div className="text-center">
                <span className="text-gray-400 text-sm block">
                  Crafted by <span className="text-white font-semibold">Lacki Lohar</span>
                </span>
                <span className="text-gray-500 text-xs">Senior Developer</span>
              </div>
            </div>
          </div>

          {/* Right - Social Links & Actions */}
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2">
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
            </div>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="text-xs text-gray-500">
              <span className="block">Plagiarism Detection</span>
              <span className="text-indigo-400">System v2.0</span>
            </div>
          </div>
        </div>
        
        {/* Bottom divider with subtle branding */}
        <div className="border-t border-white/5 pt-4 pb-2 max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Built with React & FastAPI</span>
            <span>Powered by AI Technology</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
