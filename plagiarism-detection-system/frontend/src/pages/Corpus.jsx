import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getCorpus, uploadFile, uploadURL, deleteCorpusDoc } from "../api";
import { Upload, Link2, FileText, Globe, Trash2, Database } from "lucide-react";

export default function Corpus() {
  const [corpus, setCorpus] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCorpus = async () => {
    const res = await getCorpus();
    setCorpus(res.data);
  };

  useEffect(() => { fetchCorpus(); }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [],
      "text/plain": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: true,
    onDrop: async (files) => {
      setLoading(true);
      const toastId = toast.loading(`Uploading ${files.length} file(s)...`);
      try {
        await Promise.all(files.map((f) => uploadFile(f)));
        toast.success(`${files.length} file(s) added to corpus`, { id: toastId });
        fetchCorpus();
      } catch (e) {
        toast.error(e.response?.data?.detail || "Upload failed.", { id: toastId });
      }
      setLoading(false);
    },
  });

  const handleURLUpload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    const toastId = toast.loading("Fetching URL...");
    try {
      await uploadURL(url);
      toast.success("URL added to corpus", { id: toastId });
      setUrl("");
      fetchCorpus();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to fetch URL.", { id: toastId });
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    await deleteCorpusDoc(id);
    toast.success(`Removed "${name}"`);
    fetchCorpus();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Corpus <span className="gradient-text">Manager</span>
        </h1>
        <p className="text-gray-500">Add documents to your corpus. These will be used as reference for plagiarism detection.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* File Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 h-full ${
            isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-white/10 hover:border-indigo-500/40 glass"
          }`}>
            <input {...getInputProps()} />
            {isDragActive && <div className="absolute inset-0 rounded-2xl shimmer" />}
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Upload size={24} className="text-indigo-400" />
            </div>
            <p className="text-white font-semibold mb-1">Upload Files</p>
            <p className="text-gray-500 text-sm">PDF, DOCX, TXT · Multiple files supported</p>
            <p className="text-gray-600 text-xs mt-2">Drag & drop or click to browse</p>
          </div>
        </motion.div>

        {/* URL Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Globe size={18} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Add from URL</p>
                <p className="text-gray-500 text-xs">Scrape and add web content</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors mb-4">
              <Link2 size={14} className="text-gray-500 shrink-0" />
              <input value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleURLUpload()}
                placeholder="https://example.com/article"
                className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" />
            </div>
          </div>
          <motion.button onClick={handleURLUpload} disabled={loading || !url.trim()}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
            Add URL to Corpus
          </motion.button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl px-6 py-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database size={18} className="text-indigo-400" />
          <span className="text-white font-semibold">Corpus Documents</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">{corpus.length}</span>
          <span className="text-gray-500 text-sm">documents</span>
        </div>
      </motion.div>

      {/* Document List */}
      <div className="glass rounded-2xl overflow-hidden">
        {corpus.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Database size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-500">No documents in corpus yet</p>
            <p className="text-gray-600 text-sm mt-1">Upload files or add URLs above</p>
          </div>
        ) : (
          <AnimatePresence>
            {corpus.map((doc, i) => (
              <motion.div key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${doc.source_type === "url" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                    {doc.source_type === "url" ? <Globe size={15} className="text-purple-400" /> : <FileText size={15} className="text-blue-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.filename}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.source_type === "url" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {doc.source_type}
                    </span>
                  </div>
                </div>
                <motion.button onClick={() => handleDelete(doc.id, doc.filename)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all">
                  <Trash2 size={14} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
