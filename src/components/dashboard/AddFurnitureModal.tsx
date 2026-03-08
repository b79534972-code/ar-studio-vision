import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Upload, Box, Loader2, Check, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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

type Step = "upload" | "details" | "preview";

const AddFurnitureModal = ({ open, onClose }: AddFurnitureModalProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<FurnitureForm>({
    name: "",
    category: "",
    width: "",
    height: "",
    depth: "",
    shape: "Auto (from image)",
    material: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const reset = () => {
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setGenerating(false);
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

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setStep("preview"); }, 2200);
  };

  const handleSave = () => {
    toast({ title: t("furniture.saved"), description: `"${form.name}" ${t("furniture.savedDesc")}` });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            {step === "upload" && t("furniture.add")}
            {step === "details" && t("furniture.details")}
            {step === "preview" && t("furniture.preview")}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
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
                  <Label className="text-xs">{t("furniture.dimensions")} *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input placeholder="Width" type="number" value={form.width} onChange={(e) => updateField("width", e.target.value)} />
                    <Input placeholder="Height" type="number" value={form.height} onChange={(e) => updateField("height", e.target.value)} />
                    <Input placeholder="Depth" type="number" value={form.depth} onChange={(e) => updateField("depth", e.target.value)} />
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
                <Button className="flex-1 gap-2" disabled={!canGenerate || generating} onClick={handleGenerate}>
                  {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("furniture.generating")}</> : <><Sparkles className="w-4 h-4" /> {t("furniture.generate")}</>}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-5">
              <div className="aspect-square max-h-64 mx-auto bg-secondary/40 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-3">
                <Box className="w-16 h-16 text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground">{t("furniture.preview")}</p>
                <p className="text-xs text-muted-foreground">{form.width} × {form.height} × {form.depth} cm</p>
              </div>

              <div className="bg-accent/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("furniture.name")}</span>
                  <span className="text-sm font-medium text-foreground">{form.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("furniture.category")}</span>
                  <span className="text-sm text-foreground">{form.category}</span>
                </div>
                {form.material && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("furniture.material")}</span>
                    <span className="text-sm text-foreground">{form.material}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("furniture.shape")}</span>
                  <span className="text-sm text-foreground">{form.shape}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>{t("furniture.editDetails")}</Button>
                <Button className="flex-1 gap-2" onClick={handleSave}><Check className="w-4 h-4" /> {t("furniture.save")}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 pt-2">
          {(["upload", "details", "preview"] as Step[]).map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFurnitureModal;
