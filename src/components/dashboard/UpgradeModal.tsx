import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  reason: string;
  onClose: () => void;
}

const UpgradeModal = ({ open, reason, onClose }: UpgradeModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-8 mx-4 max-w-sm w-full shadow-elevated border border-border/50 text-center relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Upgrade Required
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{reason}</p>
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => {
                  onClose();
                  navigate("/pricing");
                }}
              >
                View Plans
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
