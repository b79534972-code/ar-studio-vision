import { motion } from "framer-motion";
import { Armchair, Lamp, TreePine, Sofa } from "lucide-react";

const objects = [
  { Icon: Armchair, x: "-8%", y: "20%", size: 28, delay: 0, duration: 6 },
  { Icon: Lamp, x: "95%", y: "15%", size: 24, delay: 1, duration: 7 },
  { Icon: TreePine, x: "90%", y: "65%", size: 22, delay: 2, duration: 5.5 },
  { Icon: Sofa, x: "-5%", y: "70%", size: 26, delay: 0.5, duration: 6.5 },
];

const FloatingObjects = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {objects.map(({ Icon, x, y, size, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/15"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -12, 0, 8, 0],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} strokeWidth={1.2} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingObjects;
