import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import problemImage from "@/assets/small-room-problem.jpg";

const problems = [
  "Hard to imagine furniture size in your space",
  "Afraid it won't fit through the door or in the corner",
  "No space for layout mistakes — every centimeter counts",
];

const ProblemSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-card border border-border/50">
              <img
                src={problemImage}
                alt="A small studio apartment with oversized furniture that barely fits"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              Living in a Small Apartment?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Studio apartments demand precision. One wrong furniture choice can make your space feel cramped and unusable.
            </p>
            <div className="space-y-4">
              {problems.map((problem, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary border border-border/50">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground font-medium">{problem}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
