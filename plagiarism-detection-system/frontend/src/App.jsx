import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Check from "./pages/Check";
import Corpus from "./pages/Corpus";
import Results from "./pages/Results";

const themeMap = {
  "/": "theme-check",
  "/corpus": "theme-corpus",
  "/results": "theme-results",
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2 }}>
        <Routes location={location}>
          <Route path="/" element={<Check />} />
          <Route path="/corpus" element={<Corpus />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  const theme = themeMap[location.pathname] || "theme-check";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f1e" }}>
      <div className={`animated-bg ${theme}`}>
        <div className="orb" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
