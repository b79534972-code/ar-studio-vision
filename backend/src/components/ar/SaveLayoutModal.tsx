/**
 * SaveLayoutModal — Prompt to sign up to save AR layouts.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface SaveLayoutModalProps {
  open: boolean;
  onClose: () => void;
}

const SaveLayoutModal = ({ open, onClose }: SaveLayoutModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
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
              <Save className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Create an account to save your layout.
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Sign up to save, compare, and revisit your AR layouts anytime.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => navigate("/signup?redirect=ar")}
              >
                Sign Up
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveLayoutModal;
