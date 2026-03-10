import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Ruler, Camera, QrCode, Eye, ExternalLink } from "lucide-react";
import type { FurnitureItem } from "@/types/editor";
import { useIsTouchDevice } from "@/hooks/use-touch-device";
import { detectPlatform } from "@/ar/ARModeManager";
import { useState, useEffect } from "react";
import type { ARPlatform } from "@/ar/types";

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
  const isTouchDevice = useIsTouchDevice();
  const [platform, setPlatform] = useState<ARPlatform>("desktop");

  useEffect(() => {
    if (open && isTouchDevice) {
      detectPlatform().then((result) => setPlatform(result.platform));
    }
  }, [open, isTouchDevice]);

  if (!item) return null;

  const arUrl = buildARUrl(item);

  const handleOpenAR = () => {
    if (platform === "quicklook" && item.usdzUrl) {
      // iOS: launch AR Quick Look directly via hidden anchor
      const a = document.createElement("a");
      a.rel = "ar";
      a.href = item.usdzUrl;
      a.style.display = "none";
      const img = document.createElement("img");
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      a.appendChild(img);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
    } else {
      // Android WebXR or fallback: navigate to AR demo page
      window.location.href = arUrl;
    }
  };

  const isIOS = platform === "quicklook";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Preview in AR
          </DialogTitle>
          <DialogDescription>
            {isTouchDevice
              ? <>View <span className="font-medium text-foreground">{item.name}</span> in your space using {isIOS ? "AR Quick Look" : "WebXR"}.</>
              : <>Scan with your phone to view <span className="font-medium text-foreground">{item.name}</span> in augmented reality.</>
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {isTouchDevice ? (
            /* ===== Mobile/Tablet: Direct AR launch ===== */
            <div className="w-full space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {isIOS ? "View in AR Quick Look" : "Open AR Viewer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isIOS
                      ? "Place this furniture in your room using Apple AR Quick Look."
                      : "Use your camera to place this furniture in your space with WebXR."}
                  </p>
                </div>
                <Button className="w-full gap-2" onClick={handleOpenAR}>
                  <ExternalLink className="w-4 h-4" />
                  {isIOS ? "Launch AR Quick Look" : "Open AR Viewer"}
                </Button>
              </div>
            </div>
          ) : (
            /* ===== Desktop: QR Code ===== */
            <>
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

              <div className="w-full space-y-2">
                {[
                  { icon: Camera, text: "Open camera on your phone" },
                  { icon: QrCode, text: "Scan the QR code above" },
                  { icon: Eye, text: "View furniture in your space" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <s.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground mr-1">{i + 1}.</span>
                      {s.text}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Furniture info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-accent/40 rounded-xl px-4 py-2.5 w-full">
            <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="w-px h-3 bg-border" />
            <Ruler className="w-3 h-3" />
            <span>
              {(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} × {(item.dimensions.height * 100).toFixed(0)} cm
            </span>
          </div>

          <p className="text-muted-foreground/60 text-[11px] text-center max-w-xs">
            {isTouchDevice
              ? "AR experience uses your device camera to place furniture at real-world scale"
              : "Model data is encoded directly in the QR — works across devices without sharing storage"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureARModal;
