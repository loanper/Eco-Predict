import { motion } from "framer-motion";

const DPE_SCALE = [
  { classe: "A", max: 50,  color: "#319834", textColor: "#fff" },
  { classe: "B", max: 90,  color: "#33cc33", textColor: "#fff" },
  { classe: "C", max: 150, color: "#cbfc33", textColor: "#333" },
  { classe: "D", max: 230, color: "#fbef32", textColor: "#333" },
  { classe: "E", max: 330, color: "#fbb832", textColor: "#333" },
  { classe: "F", max: 450, color: "#f17e30", textColor: "#fff" },
  { classe: "G", max: 9999, color: "#ee1d23", textColor: "#fff" },
];

const GES_SCALE = [
  { classe: "A", max: 5,   color: "#f2e6ff", textColor: "#5b21b6" },
  { classe: "B", max: 10,  color: "#ddd6fe", textColor: "#5b21b6" },
  { classe: "C", max: 20,  color: "#c4b5fd", textColor: "#fff" },
  { classe: "D", max: 35,  color: "#a78bfa", textColor: "#fff" },
  { classe: "E", max: 55,  color: "#8b5cf6", textColor: "#fff" },
  { classe: "F", max: 80,  color: "#7c3aed", textColor: "#fff" },
  { classe: "G", max: 9999, color: "#6d28d9", textColor: "#fff" },
];

function GaugeBar({ scale, value, currentClasse, label, unit }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{label}</p>
      <div className="space-y-1">
        {scale.map((row, i) => {
          const isActive = row.classe === currentClasse;
          const widthPct = 40 + i * 10;
          return (
            <div key={row.classe} className="flex items-center gap-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="h-7 rounded-r-md flex items-center justify-between px-2 relative"
                style={{
                  backgroundColor: row.color,
                  opacity: isActive ? 1 : 0.35,
                }}
              >
                <span className="text-xs font-bold" style={{ color: row.textColor }}>
                  {row.classe}
                </span>
                <span className="text-[10px]" style={{ color: row.textColor }}>
                  ≤ {row.max === 9999 ? "∞" : row.max}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <span className="text-xs font-bold text-gray-700">◄</span>
                  <span className="text-sm font-bold text-gray-800">{value} {unit}</span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DPEGauge({ diagnostic }) {
  if (!diagnostic) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <GaugeBar
        scale={DPE_SCALE}
        value={diagnostic.consommation_kwh_m2_an}
        currentClasse={diagnostic.classe_dpe}
        label="Consommation énergétique (DPE)"
        unit="kWh/m²/an"
      />
      <GaugeBar
        scale={GES_SCALE}
        value={diagnostic.emission_co2_kg_m2_an}
        currentClasse={diagnostic.classe_ges}
        label="Émissions de gaz à effet de serre (GES)"
        unit="kg CO₂/m²/an"
      />
    </div>
  );
}
