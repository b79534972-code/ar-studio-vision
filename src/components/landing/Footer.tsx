const Footer = () => {
  return (
    <footer className="py-6 md:py-8 bg-background border-t border-border">
      <div className="px-4 md:px-6 lg:px-12 xl:px-20 2xl:px-32 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 font-display text-sm font-semibold text-foreground tracking-tight">
          <img src="/logo.png" alt="InteriorAR logo" className="w-5 h-5 object-contain" />
          <span>InteriorAR<span className="text-primary">.</span></span>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground text-center">
          © 2026 InteriorAR. AI + AR Interior Design Research Platform.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
