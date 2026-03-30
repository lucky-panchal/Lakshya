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
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left - Branding */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">© 2026</span>
          <span className="text-white font-semibold text-sm">Lakshya<span className="gradient-text">AI</span></span>
          <span className="text-gray-600 text-sm">· Plagiarism Detection System</span>
        </div>

        {/* Center - Created by */}
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
          <img
            src={profileImg}
            alt="Lacki Lohar"
            className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
          />
          <span className="text-gray-400 text-sm">
            Created by <span className="text-white font-semibold">Lacki Lohar</span>
          </span>
        </div>

        {/* Right - Links */}
        <div className="flex items-center gap-3">
          <a href="https://github.com/lucky-panchal" target="_blank" rel="noreferrer" title="GitHub"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Code2 size={15} />
          </a>
          <a href="https://in.linkedin.com/in/lacki-lohar-463a23321" target="_blank" rel="noreferrer" title="LinkedIn"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <ExternalLink size={15} />
          </a>
          <a href="https://lackilohar.netlify.app" target="_blank" rel="noreferrer" title="Portfolio"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Globe size={15} />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
