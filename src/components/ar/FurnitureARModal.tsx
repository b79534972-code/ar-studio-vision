import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Smartphone, Camera, QrCode, Eye, Ruler } from "lucide-react";
import type { FurnitureItem } from "@/types/editor";

interface FurnitureARModalProps {
  open: boolean;
  onClose: () => void;
  item: FurnitureItem | null;
}

const FurnitureARModal = ({ open, onClose, item }: FurnitureARModalProps) => {
  if (!item) return null;

  const payload = {
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    material: item.material,
    dimensions: item.dimensions,
  };

  const encodedId = btoa(JSON.stringify(payload)).slice(0, 32);
  const arUrl = `${window.location.origin}/ar-object/${encodedId}`;

  if (open) {
    try {
      localStorage.setItem(`ar-object-${encodedId}`, JSON.stringify(payload));
    } catch {
      // storage full
    }
  }

  const steps = [
    { icon: Camera, text: "Open camera on your phone" },
    { icon: QrCode, text: "Scan the QR code below" },
    { icon: Eye, text: "View furniture in your space" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Preview in AR
          </DialogTitle>
          <DialogDescription>
            Scan with your phone to view <span className="font-medium text-foreground">{item.name}</span> in augmented reality.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-soft border border-border/30">
            <QRCodeSVG
              value={arUrl}
              size={200}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="hsl(235, 60%, 52%)"
            />
          </div>

          {/* Furniture info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-accent/40 rounded-xl px-4 py-2.5">
            <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="w-px h-3 bg-border" />
            <Ruler className="w-3 h-3" />
            <span>
              {(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} × {(item.dimensions.height * 100).toFixed(0)} cm
            </span>
          </div>

          {/* Steps */}
          <div className="w-full space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground mr-1">{i + 1}.</span>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureARModal;
