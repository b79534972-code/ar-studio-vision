import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wand2, Check, ArrowRight, Loader2,
  Home, BedDouble, Sofa, Monitor, LayoutGrid, Eye, Pencil,
  ChefHat, Bath, UtensilsCrossed, Baby, TreePalm, Shirt,
  ChevronDown, Users, DollarSign, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { AILayoutSuggestion } from "@/types/editor";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
const ROOM_TYPES = [
  { value: "living", label: "Living Room", icon: Sofa },
  { value: "bedroom", label: "Bedroom", icon: BedDouble },
  { value: "studio", label: "Studio Apt", icon: Home },
  { value: "office", label: "Home Office", icon: Monitor },
  { value: "kitchen", label: "Kitchen", icon: ChefHat },
  { value: "dining", label: "Dining Room", icon: UtensilsCrossed },
  { value: "bathroom", label: "Bathroom", icon: Bath },
  { value: "kids", label: "Kids Room", icon: Baby },
  { value: "balcony", label: "Balcony", icon: TreePalm },
  { value: "closet", label: "Walk-in Closet", icon: Shirt },
];

const DESIGN_STYLES = [
  { value: "minimalist", label: "Minimalist", color: "#E5E7EB" },
  { value: "scandinavian", label: "Scandinavian", color: "#FDE68A" },
  { value: "modern", label: "Modern", color: "#93C5FD" },
  { value: "japanese", label: "Japanese", color: "#A7F3D0" },
  { value: "industrial", label: "Industrial", color: "#9CA3AF" },
  { value: "bohemian", label: "Bohemian", color: "#F9A8D4" },
  { value: "mid-century", label: "Mid-Century", color: "#FDBA74" },
  { value: "coastal", label: "Coastal", color: "#67E8F9" },
  { value: "rustic", label: "Rustic", color: "#D6B38C" },
  { value: "art-deco", label: "Art Deco", color: "#C4B5FD" },
  { value: "tropical", label: "Tropical", color: "#86EFAC" },
  { value: "contemporary", label: "Contemporary", color: "#CBD5E1" },
];

const PURPOSES = [
  { value: "relax", label: "Relaxation" },
  { value: "work", label: "Productivity" },
  { value: "entertain", label: "Entertaining" },
  { value: "sleep", label: "Sleep & Rest" },
  { value: "multi", label: "Multi-purpose" },
  { value: "kids-play", label: "Kids Play" },
];

const FURNITURE_PREFS = [
  { value: "sofa", label: "Sofa" },
  { value: "desk", label: "Desk" },
  { value: "bookshelf", label: "Bookshelf" },
  { value: "tv-unit", label: "TV Unit" },
  { value: "dining-table", label: "Dining Table" },
  { value: "bed", label: "Bed" },
  { value: "wardrobe", label: "Wardrobe" },
  { value: "plants", label: "Plants" },
  { value: "rug", label: "Rug" },
  { value: "reading-nook", label: "Reading Nook" },
];

const MOCK_SUGGESTIONS: AILayoutSuggestion[] = [
  {
    id: "layout-a",
    name: "Open Flow",
    style: "minimalist",
    score: 95,
    description: "Maximizes movement space with furniture along walls. Best for daily activities and small gatherings.",
    objects: [],
  },
  {
    id: "layout-b",
    name: "Cozy Corner",
    style: "scandinavian",
    score: 88,
    description: "Creates an intimate seating area centered around a focal point. Great for relaxation and reading.",
    objects: [],
  },
  {
    id: "layout-c",
    name: "Multi-Zone",
    style: "modern",
    score: 82,
    description: "Divides the room into distinct functional zones — work, rest, and entertainment.",
    objects: [],
  },
];

const AILayoutGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"config" | "generating" | "results">("config");
  const [roomType, setRoomType] = useState("living");
  const [designStyle, setDesignStyle] = useState("minimalist");
  const [width, setWidth] = useState("5");
  const [depth, setDepth] = useState("4");
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<AILayoutSuggestion[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [occupants, setOccupants] = useState([2]);
  const [budget, setBudget] = useState("medium");
  const [purposes, setPurposes] = useState<string[]>([]);
  const [furniturePrefs, setFurniturePrefs] = useState<string[]>([]);

  const handleGenerate = async () => {
    setStep("generating");
    setProgress(0);

    // Simulate AI processing
    for (let i = 0; i <= 100; i += 2) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(i);
    }

    setSuggestions(MOCK_SUGGESTIONS);
    setStep("results");
  };

  const handleApply = (suggestion: AILayoutSuggestion) => {
    toast({ title: t("aiGen.layoutApplied"), description: `"${suggestion.name}"` });
    navigate("/dashboard/editor");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("aiGen.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("aiGen.subtitle")}</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Configuration ─── */}
        {step === "config" && (
          <motion.div key="config" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="bg-card rounded-2xl border border-border/40 shadow-card p-6 space-y-6">
              {/* Room Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("aiGen.roomType")}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {ROOM_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      onClick={() => setRoomType(rt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                        roomType === rt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/40 hover:border-border"
                      )}
                    >
                      <rt.icon className={cn("w-5 h-5", roomType === rt.value ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[11px] font-medium">{rt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Style */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("aiGen.designStyle")}</Label>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_STYLES.map((ds) => (
                    <button
                      key={ds.value}
                      onClick={() => setDesignStyle(ds.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                        designStyle === ds.value
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-border"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                      {ds.label}
                      {designStyle === ds.value && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("aiGen.dimensions")}</Label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("aiGen.widthLabel")}</Label>
                    <Input value={width} onChange={(e) => setWidth(e.target.value)} type="number" min={2} max={20} step={0.5} className="h-9" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("aiGen.depthLabel")}</Label>
                    <Input value={depth} onChange={(e) => setDepth(e.target.value)} type="number" min={2} max={20} step={0.5} className="h-9" />
                  </div>
                  <div className="flex-1 flex items-end">
                    <div className="bg-accent/40 rounded-xl p-3 text-center w-full">
                      <p className="text-lg font-bold text-foreground">{(parseFloat(width) * parseFloat(depth)).toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{t("aiGen.totalArea")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                {t("aiGen.advanced")}
                {(purposes.length > 0 || furniturePrefs.length > 0) && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                    {purposes.length + furniturePrefs.length} {t("aiGen.selected")}
                  </Badge>
                )}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Occupants */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">{t("aiGen.occupants")}</Label>
                      </div>
                      <Input
                        type="number"
                        value={occupants[0]}
                        onChange={(e) => setOccupants([Math.max(1, Math.min(20, parseInt(e.target.value) || 1))])}
                        min={1}
                        max={20}
                        className="h-9 w-32"
                        placeholder="e.g. 2"
                      />
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">{t("aiGen.budget")}</Label>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { value: "low", label: "Budget", desc: "Essential items only" },
                          { value: "medium", label: "Mid-range", desc: "Balanced quality" },
                          { value: "high", label: "Premium", desc: "High-end pieces" },
                          { value: "luxury", label: "Luxury", desc: "No limits" },
                        ].map((b) => (
                          <button
                            key={b.value}
                            onClick={() => setBudget(b.value)}
                            className={cn(
                              "flex-1 p-2.5 rounded-xl border text-center transition-all",
                              budget === b.value
                                ? "border-primary bg-primary/5"
                                : "border-border/40 hover:border-border"
                            )}
                          >
                            <p className="text-xs font-medium">{b.label}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{b.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Primary Purpose</Label>
                        <span className="text-[10px] text-muted-foreground">(select multiple)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PURPOSES.map((p) => {
                          const active = purposes.includes(p.value);
                          return (
                            <button
                              key={p.value}
                              onClick={() => setPurposes((prev) =>
                                active ? prev.filter((v) => v !== p.value) : [...prev, p.value]
                              )}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                active
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border/40 hover:border-border text-muted-foreground"
                              )}
                            >
                              {p.label}
                              {active && <Check className="w-3 h-3 inline ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Furniture Preferences */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Must-Have Furniture</Label>
                      <div className="flex flex-wrap gap-2">
                        {FURNITURE_PREFS.map((f) => {
                          const active = furniturePrefs.includes(f.value);
                          return (
                            <button
                              key={f.value}
                              onClick={() => setFurniturePrefs((prev) =>
                                active ? prev.filter((v) => v !== f.value) : [...prev, f.value]
                              )}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/40 hover:border-border text-muted-foreground"
                              )}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Prompt */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Prompt <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I want a cozy reading nook by the window, TV facing the sofa, and space for a yoga mat..."
                  className="min-h-[80px] text-sm resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Describe your preferences, requirements, or specific furniture arrangements you'd like the AI to consider.
                </p>
              </div>

              <Button className="w-full gap-2 h-11" onClick={handleGenerate}>
                <Wand2 className="w-4 h-4" /> Generate AI Layouts
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── Step 2: Generating ─── */}
        {step === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-card rounded-2xl border border-border/40 shadow-card p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Generating Layouts</h2>
              <p className="text-sm text-muted-foreground mt-1">AI is analyzing your room and creating optimal furniture arrangements…</p>
            </div>
            <div className="max-w-sm mx-auto space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
            <div className="flex justify-center gap-6 text-[10px] text-muted-foreground">
              <span>🔍 Analyzing dimensions</span>
              <span>🪑 Selecting furniture</span>
              <span>📐 Optimizing placement</span>
            </div>
          </motion.div>
        )}

        {/* ─── Step 3: Results ─── */}
        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">AI Suggestions</h2>
                <p className="text-xs text-muted-foreground">3 layout options generated for your {ROOM_TYPES.find((r) => r.value === roomType)?.label}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setStep("config")}>
                Regenerate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "bg-card rounded-2xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300",
                    i === 0 ? "border-primary/30" : "border-border/40"
                  )}
                >
                  {/* Visual preview */}
                  <div className="aspect-[4/3] bg-accent/30 relative flex items-center justify-center">
                    <LayoutGrid className="w-12 h-12 text-muted-foreground/20" />
                    {i === 0 && (
                      <Badge className="absolute top-2.5 left-2.5 text-[9px] bg-primary text-primary-foreground">
                        Best Match
                      </Badge>
                    )}
                    <div className="absolute top-2.5 right-2.5 bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-xs font-bold text-foreground">{s.score}%</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{s.name}</h3>
                      <Badge variant="outline" className="text-[9px] capitalize mt-1">{s.style}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1.5 text-xs h-8" onClick={() => handleApply(s)}>
                        <Check className="w-3 h-3" /> Apply
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => navigate("/dashboard/editor")}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Space analysis */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border/40 shadow-card p-5"
            >
              <h3 className="font-display text-sm font-bold text-foreground mb-3">Space Analysis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Space Efficiency", value: "82%", color: "text-success" },
                  { label: "Walking Paths", value: "Clear", color: "text-primary" },
                  { label: "Unused Area", value: "18%", color: "text-warning" },
                  { label: "Furniture Density", value: "Optimal", color: "text-success" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AILayoutGenerator;
