import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Smartphone, Ruler } from "lucide-react";
import type { FurnitureItem } from "@/types/editor";

interface FurnitureARModalProps {
  open: boolean;
  onClose: () => void;
  item: FurnitureItem | null;
}

/** Encode model metadata directly into URL — no localStorage needed */
function buildARUrl(item: FurnitureItem): string {
  const payload = {
    name: item.name,
    color: item.color,
    category: item.category,
    material: item.material,
    dimensions: item.dimensions,
    modelUrl: item.modelUrl,
    usdzUrl: item.usdzUrl,
  };
  const encoded = btoa(JSON.stringify(payload));
  return `${window.location.origin}/ar-demo?model=${encoded}`;
}

const FurnitureARModal = ({ open, onClose, item }: FurnitureARModalProps) => {
  if (!item) return null;

  const arUrl = buildARUrl(item);

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

          <p className="text-muted-foreground/60 text-[11px] text-center max-w-xs">
            Model data is encoded directly in the QR — works across devices without sharing storage
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureARModal;
