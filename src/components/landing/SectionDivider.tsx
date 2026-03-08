import { motion } from "framer-motion";

const SectionDivider = () => {
  return (
    <motion.div
      className="relative h-8 mx-auto max-w-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(235 60% 60% / 0.15), hsl(210 70% 60% / 0.2), hsl(235 60% 60% / 0.15), transparent)",
          }}
        />
      </div>

      {/* Center marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "hsl(235 60% 60% / 0.3)",
              boxShadow: "0 0 10px 2px hsl(235 60% 60% / 0.1)",
            }}
          />
          {/* Scanning ring */}
          <motion.div
            className="absolute -inset-2 rounded-full border border-primary/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Side tick marks */}
      {[-1, 1].map((dir) => (
        <div
          key={dir}
          className="absolute top-1/2 -translate-y-1/2"
          style={{ [dir === -1 ? "left" : "right"]: "25%" }}
        >
          <div className="w-px h-2" style={{ background: "hsl(235 60% 60% / 0.12)" }} />
        </div>
      ))}
    </motion.div>
  );
};

export default SectionDivider;
