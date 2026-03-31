import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getCorpus, uploadFile, uploadURL, deleteCorpusDoc } from "../api";
import ProfessionalLayout, { 
  ProfessionalHeader, 
  ProfessionalSection, 
  ProfessionalCard, 
  ProfessionalButton, 
  ProfessionalGrid,
  ProfessionalBadge 
} from "../components/ProfessionalLayout";
import { Upload, Link2, FileText, Globe, Trash2, Database, Plus } from "lucide-react";

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
    <ProfessionalLayout fullWidth>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1a1f35", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      }} />

      {/* Professional Header */}
      <ProfessionalHeader
        title={<>Corpus <span className="gradient-text">Manager</span></>}
        subtitle="Add documents to your corpus. These will be used as reference for plagiarism detection."
        rightContent={
          <ProfessionalSection spacing="tight">
            <ProfessionalBadge variant="info" size="normal">
              <Database size={12} className="mr-1" />
              {corpus.length} documents
            </ProfessionalBadge>
            <ProfessionalButton variant="primary" size="small">
              <Plus size={14} className="mr-1" />
              Add Content
            </ProfessionalButton>
          </ProfessionalSection>
        }
      />

      {/* Upload Section — stacks on mobile */}
      <ProfessionalGrid cols="2" gap="normal" className="mb-6 sm:mb-8">
        {/* File Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <ProfessionalCard 
            className={`border-2 border-dashed cursor-pointer transition-all h-full ${
              isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-white/10 hover:border-indigo-500/40"
            }`}
            {...getRootProps()
            }
          >
            <input {...getInputProps()} />
            {isDragActive && <div className="absolute inset-0 rounded-2xl shimmer" />}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-indigo-400" />
              </div>
              <p className="text-white font-semibold mb-1">Upload Files</p>
              <p className="text-gray-500 text-sm mb-2">PDF, DOCX, TXT · Multiple files supported</p>
              <p className="text-gray-600 text-xs">Drag & drop or click to browse</p>
            </div>
          </ProfessionalCard>
        </motion.div>

        {/* URL Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <ProfessionalCard className="flex flex-col justify-between h-full">
            <div>
              <ProfessionalSection spacing="tight" className="mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Globe size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Add from URL</p>
                  <p className="text-gray-500 text-xs">Scrape and add web content</p>
                </div>
              </ProfessionalSection>
              
              <ProfessionalSection 
                spacing="tight" 
                className="border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors mb-4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Link2 size={14} className="text-gray-500 shrink-0" />
                <input 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleURLUpload()}
                  placeholder="https://example.com/article"
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" 
                />
              </ProfessionalSection>
            </div>
            
            <ProfessionalButton
              variant="primary"
              size="normal"
              onClick={handleURLUpload}
              disabled={loading || !url.trim()}
              className="w-full"
            >
              Add URL to Corpus
            </ProfessionalButton>
          </ProfessionalCard>
        </motion.div>
      </ProfessionalGrid>

      {/* Professional Stats Card */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <ProfessionalCard>
          <ProfessionalSection alignment="between">
            <ProfessionalSection spacing="tight">
              <Database size={18} className="text-indigo-400" />
              <span className="text-white font-semibold">Corpus Documents</span>
            </ProfessionalSection>
            <ProfessionalSection spacing="tight">
              <span className="text-2xl font-bold gradient-text">{corpus.length}</span>
              <span className="text-gray-500 text-sm">documents</span>
            </ProfessionalSection>
          </ProfessionalSection>
        </ProfessionalCard>
      </motion.div>

      {/* Professional Document List */}
      <ProfessionalCard className="overflow-hidden p-0">
        {corpus.length === 0 ? (
          <div className="py-16 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <motion.div 
                animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-purple-500/10" 
              />
              <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <Database size={22} className="text-gray-600" />
              </div>
            </div>
            <p className="text-gray-400 font-medium text-sm">Corpus is empty</p>
            <p className="text-gray-600 text-xs mt-1">Upload files or add URLs above to get started</p>
            <ProfessionalSection alignment="center" spacing="tight" className="mt-4">
              {["bg-purple-500/30", "bg-indigo-500/30", "bg-pink-500/30"].map((c, i) => (
                <motion.div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full ${c}`}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }} 
                />
              ))}
            </ProfessionalSection>
          </div>
        ) : (
          <AnimatePresence>
            {corpus.map((doc, i) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 hover:bg-white/3 transition-colors group last:border-b-0"
              >
                <ProfessionalSection spacing="tight" className="min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.source_type === "url" 
                      ? "bg-purple-500/20 border border-purple-500/20" 
                      : "bg-blue-500/20 border border-blue-500/20"
                  }`}>
                    {doc.source_type === "url" ? 
                      <Globe size={15} className="text-purple-400" /> : 
                      <FileText size={15} className="text-blue-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.filename}</p>
                    <ProfessionalBadge 
                      variant={doc.source_type === "url" ? "info" : "default"} 
                      size="small"
                      className="mt-1"
                    >
                      {doc.source_type}
                    </ProfessionalBadge>
                  </div>
                </ProfessionalSection>
                
                <motion.button
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </ProfessionalCard>
    </ProfessionalLayout>
  );
}
