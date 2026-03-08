import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Upload, Loader2, X, Sparkles, Smartphone, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import FurniturePreview3D from "./FurniturePreview3D";
import FurnitureARStep from "./FurnitureARStep";
import { customFurnitureStore } from "@/stores/customFurnitureStore";
import type { FurnitureItem } from "@/types/editor";

interface AddFurnitureModalProps {
  open: boolean;
  onClose: () => void;
}

interface FurnitureForm {
  name: string;
  category: string;
  width: string;
  height: string;
  depth: string;
  shape: string;
  material: string;
}

const categories = ["Chair", "Table", "Sofa", "Shelf", "Bed", "Lamp", "Desk", "Cabinet", "Other"];
const shapes = ["Auto (from image)", "Box", "Cylinder", "Rounded Box"];
const materials = ["Wood", "Metal", "Fabric", "Leather", "Glass", "Plastic", "Marble"];

const CATEGORY_MAP: Record<string, FurnitureItem["category"]> = {
  Chair: "chair", Table: "table", Sofa: "sofa", Shelf: "shelf", Bed: "bed",
  Lamp: "lamp", Desk: "table", Cabinet: "storage", Other: "chair",
};

const MATERIAL_COLORS: Record<string, string> = {
  Wood: "#92400E", Metal: "#4B5563", Fabric: "#6B7280", Leather: "#78350F",
  Glass: "#93C5FD", Plastic: "#9CA3AF", Marble: "#E5E7EB", "": "#6B7280",
};

type Step = "upload" | "details" | "generating" | "preview3d" | "ar";

const STEPS: Step[] = ["upload", "details", "generating", "preview3d", "ar"];

const AddFurnitureModal = ({ open, onClose }: AddFurnitureModalProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [unit, setUnit] = useState<"cm" | "m">("cm");
  const [form, setForm] = useState<FurnitureForm>({
    name: "", category: "", width: "", height: "", depth: "",
    shape: "Auto (from image)", material: "",
  });
  const [savedItem, setSavedItem] = useState<FurnitureItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const reset = () => {
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setGenerateProgress(0);
    setSavedItem(null);
    setUnit("cm");
    setForm({ name: "", category: "", width: "", height: "", depth: "", shape: "Auto (from image)", material: "" });
  };

  const handleClose = () => { reset(); onClose(); };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("furniture.invalidFile"), description: t("furniture.invalidFileDesc"), variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setStep("details");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setStep("details");
  };

  const updateField = (key: keyof FurnitureForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canGenerate = form.name && form.category && form.width && form.height && form.depth;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    setStep("generating");
    setGenerateProgress(0);

    // Simulate phased progress
    const phases = [
      { target: 25, delay: 300, label: "Analyzing image…" },
      { target: 55, delay: 800, label: "Detecting shape…" },
      { target: 80, delay: 1400, label: "Generating mesh…" },
      { target: 100, delay: 2000, label: "Finalizing…" },
    ];
    phases.forEach(({ target, delay }) => {
      setTimeout(() => setGenerateProgress(target), delay);
    });
    setTimeout(() => setStep("preview3d"), 2600);
  }, [canGenerate]);

  const toCm = (val: string) => {
    const n = parseFloat(val);
    if (isNaN(n)) return 0;
    return unit === "m" ? n * 100 : n;
  };

  const buildFurnitureItem = useCallback((): FurnitureItem => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return {
      id,
      name: form.name,
      category: CATEGORY_MAP[form.category] || "chair",
      style: "modern",
      material: form.material || "Mixed",
      color: MATERIAL_COLORS[form.material] || "#6B7280",
      dimensions: {
        width: toCm(form.width) / 100,
        height: toCm(form.height) / 100,
        depth: toCm(form.depth) / 100,
      },
      tags: ["custom", "uploaded"],
      favorited: false,
      thumbnail: imagePreview || undefined,
    };
  }, [form, imagePreview, unit]);

  const handleSaveToLibrary = useCallback(() => {
    const item = buildFurnitureItem();
    customFurnitureStore.addItem(item);
    setSavedItem(item);
    toast({ title: "Saved to Library", description: `"${item.name}" is now available in your Furniture Library and Room Editor.` });
  }, [buildFurnitureItem, toast]);

  const handlePreviewInAR = () => {
    if (!savedItem) {
      const item = buildFurnitureItem();
      customFurnitureStore.addItem(item);
      setSavedItem(item);
    }
    setStep("ar");
  };

  const dims = {
    width: toCm(form.width) / 100 || 0.5,
    height: toCm(form.height) / 100 || 0.5,
    depth: toCm(form.depth) / 100 || 0.5,
  };

  const activeStepIndex = STEPS.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            {step === "upload" && t("furniture.add")}
            {step === "details" && t("furniture.details")}
            {step === "generating" && "Generating 3D Model"}
            {step === "preview3d" && "3D Preview"}
            {step === "ar" && "Preview in AR"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("furniture.upload.desc")}</p>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{t("furniture.upload.cta")}</p>
                <p className="text-xs text-muted-foreground">{t("furniture.upload.hint")}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/50 shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); setStep("upload"); }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{imageFile?.name}</p>
                  <p className="text-xs text-muted-foreground">{imageFile && `${(imageFile.size / 1024).toFixed(0)} KB`}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs">{t("furniture.name")} *</Label>
                  <Input id="name" placeholder="e.g. Modern Sofa" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("furniture.category")} *</Label>
                    <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("furniture.material")}</Label>
                    <Select value={form.material} onValueChange={(v) => updateField("material", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>{materials.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("furniture.dimensions")} *</Label>
                    <button
                      type="button"
                      onClick={() => setUnit(unit === "cm" ? "m" : "cm")}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {unit}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input placeholder={t("rooms.width")} type="number" value={form.width} onChange={(e) => updateField("width", e.target.value)} step={unit === "m" ? "0.01" : "1"} />
                    <Input placeholder={t("rooms.height")} type="number" value={form.height} onChange={(e) => updateField("height", e.target.value)} step={unit === "m" ? "0.01" : "1"} />
                    <Input placeholder={t("rooms.depth")} type="number" value={form.depth} onChange={(e) => updateField("depth", e.target.value)} step={unit === "m" ? "0.01" : "1"} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">{t("furniture.shape")}</Label>
                  <Select value={form.shape} onValueChange={(v) => updateField("shape", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{shapes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("upload")}>{t("furniture.back")}</Button>
                <Button className="flex-1 gap-2" disabled={!canGenerate} onClick={handleGenerate}>
                  <Sparkles className="w-4 h-4" /> {t("furniture.generate")}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Generating animation */}
          {step === "generating" && (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="py-10 flex flex-col items-center gap-5">
              <div className="relative w-20 h-20">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-2 rounded-xl bg-card border border-border/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {generateProgress < 30 && "Analyzing image…"}
                  {generateProgress >= 30 && generateProgress < 60 && "Detecting shape…"}
                  {generateProgress >= 60 && generateProgress < 85 && "Generating mesh…"}
                  {generateProgress >= 85 && "Finalizing model…"}
                </p>
                <p className="text-xs text-muted-foreground">{form.name} · {form.width} × {form.height} × {form.depth} {unit}</p>
              </div>
              <div className="w-full max-w-xs">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${generateProgress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right mt-1">{generateProgress}%</p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Interactive 3D Preview */}
          {step === "preview3d" && (
            <motion.div key="preview3d" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
              <FurniturePreview3D
                dimensions={dims}
                color={MATERIAL_COLORS[form.material] || "#6B7280"}
                material={form.material || "Mixed"}
              />

              <div className="bg-accent/30 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t("furniture.name")}</span>
                  <span className="text-xs font-medium text-foreground">{form.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t("furniture.category")}</span>
                  <span className="text-xs text-foreground">{form.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t("furniture.dimensions")}</span>
                  <span className="text-xs text-foreground">{form.width} × {form.height} × {form.depth} {unit}</span>
                </div>
                {form.material && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{t("furniture.material")}</span>
                    <span className="text-xs text-foreground">{form.material}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep("details")}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handlePreviewInAR}>
                  <Smartphone className="w-3.5 h-3.5" /> AR Preview
                </Button>
                <Button size="sm" className="flex-1 gap-1.5" onClick={handleSaveToLibrary} disabled={!!savedItem}>
                  <Check className="w-3.5 h-3.5" /> {savedItem ? "Saved" : "Save"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AR QR code */}
          {step === "ar" && (
            <motion.div key="ar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <FurnitureARStep
                item={savedItem || buildFurnitureItem()}
                onBack={() => setStep("preview3d")}
                onDone={handleClose}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {STEPS.filter((s) => s !== "generating").map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step || (step === "generating" && s === "details")
                  ? "w-6 bg-primary"
                  : STEPS.indexOf(s) < activeStepIndex
                  ? "w-3 bg-primary/40"
                  : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFurnitureModal;
