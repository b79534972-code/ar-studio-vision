import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "shadow-soft border-b border-border/30"
            : "bg-transparent"
        }`}
        style={
          scrolled || mobileOpen
            ? { background: "hsl(var(--card) / 0.8)", backdropFilter: "blur(20px)" }
            : {}
        }
      >
        <div className="w-full flex items-center justify-between h-14 md:h-16 px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32">
          <a
            href="#home"
            className="flex items-center gap-1 font-display text-lg md:text-xl font-bold text-foreground tracking-tight"
          >
            <img
              src="/logo.png"
              alt="InteriorAR logo"
              className="h-7 w-7 md:h-7 md:w-7 object-contain relative top-[1px]"
            />
            InteriorAR<span className="text-primary">.</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground" onClick={() => navigate("/signin")}>
              Login
            </Button>
            <Button variant="default" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 border-b border-border/30 p-4 space-y-2 md:hidden"
            style={{ background: "hsl(var(--card) / 0.9)", backdropFilter: "blur(20px)" }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1 h-11" onClick={() => { navigate("/signin"); setMobileOpen(false); }}>
                Login
              </Button>
              <Button variant="default" size="sm" className="flex-1 h-11" onClick={() => { navigate("/signup"); setMobileOpen(false); }}>
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
