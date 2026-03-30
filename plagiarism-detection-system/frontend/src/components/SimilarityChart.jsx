import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const color = val >= 70 ? "#ef4444" : val >= 40 ? "#f97316" : "#22c55e";
    return (
      <div className="glass rounded-xl px-4 py-3 border border-white/10">
        <p className="text-gray-400 text-xs mb-1 truncate max-w-xs">{label}</p>
        <p className="font-bold text-lg" style={{ color }}>{val}%</p>
      </div>
    );
  }
  return null;
};

export default function SimilarityChart({ matches }) {
  if (!matches || matches.length === 0) return null;

  const data = matches.slice(0, 8).map((m) => ({
    name: m.filename.length > 18 ? m.filename.slice(0, 18) + "…" : m.filename,
    similarity: m.similarity,
  }));

  const getColor = (value) => value >= 70 ? "#ef4444" : value >= 40 ? "#f97316" : "#22c55e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 glass rounded-2xl p-5"
    >
      <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        Similarity Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="similarity" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.similarity)} style={{ filter: `drop-shadow(0 0 4px ${getColor(entry.similarity)}60)` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
