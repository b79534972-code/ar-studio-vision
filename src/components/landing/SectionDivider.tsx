import { motion } from "framer-motion";

const SectionDivider = () => {
  return (
    <motion.div
      className="relative h-px mx-auto max-w-xs"
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(235 60% 60% / 0.25), transparent)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: "hsl(235 60% 60% / 0.4)",
          boxShadow: "0 0 8px 2px hsl(235 60% 60% / 0.15)",
        }}
      />
    </motion.div>
  );
};

export default SectionDivider;
