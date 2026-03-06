import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/80 backdrop-blur-xl shadow-soft" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a
          href="#home"
          className="flex items-center gap-2 font-display text-xl font-bold text-foreground tracking-tight"
        >
          <img src="/logo.png" alt="InteriorAR logo" className="h-6 w-6 object-contain" />
          InteriorAR<span className="text-primary">.</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground" onClick={() => navigate("/signin")}>
            Login
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
