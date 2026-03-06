const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* <p className="font-display text-sm font-semibold text-foreground tracking-tight">
          <img
            src="/logo.png"
            alt="InteriorAR logo"
            className="w-5 h-5 object-contain"
          />
          InteriorAR<span className="text-primary">.</span>
        </p> */}
        <div className="flex items-center gap-2 font-display text-sm font-semibold text-foreground tracking-tight">
          <img
            src="/logo.png"
            alt="InteriorAR logo"
            className="w-5 h-5 object-contain"
          />
          <span>
            InteriorAR<span className="text-primary">.</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 InteriorAR. AI + AR Interior Design Research Platform.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
