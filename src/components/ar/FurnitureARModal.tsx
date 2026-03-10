import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Ruler, Camera, QrCode, Eye, ExternalLink, Monitor, AlertTriangle } from "lucide-react";
import type { FurnitureItem } from "@/types/editor";
import { useIsTouchDevice } from "@/hooks/use-touch-device";
import { detectPlatform } from "@/ar/ARModeManager";
import { useState, useEffect } from "react";
import type { ARPlatform } from "@/ar/types";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      detectPlatform().then((result) => setPlatform(result.platform));
    }
  }, [open]);

  if (!item) return null;

  const arUrl = buildARUrl(item);
  const isIOS = platform === "quicklook";
  const isWebXR = platform === "webxr";
  const hasARSupport = isIOS || isWebXR;

  /** Mobile/Tablet: launch AR directly */
  const handleOpenAR = () => {
    if (isIOS && item.usdzUrl) {
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
    } else if (isWebXR) {
      // Android WebXR: navigate to AR demo page
      onClose();
      navigate(`/ar-demo?model=${btoa(JSON.stringify({
        name: item.name, color: item.color, category: item.category,
        material: item.material, dimensions: item.dimensions,
        modelUrl: item.modelUrl, usdzUrl: item.usdzUrl,
      }))}`);
    }
  };

  /** Desktop: open 3D viewer page */
  const handleOpen3DViewer = () => {
    onClose();
    navigate(`/ar-demo?model=${btoa(JSON.stringify({
      name: item.name, color: item.color, category: item.category,
      material: item.material, dimensions: item.dimensions,
      modelUrl: item.modelUrl, usdzUrl: item.usdzUrl,
    }))}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Preview in AR
          </DialogTitle>
          <DialogDescription>
            Scan the QR code or use the buttons below to preview{" "}
            <span className="font-medium text-foreground">{item.name}</span> in AR or 3D.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* ===== QR Code — Always visible on all devices ===== */}
          <div className="p-4 bg-white rounded-2xl shadow-soft border border-border/30">
            <QRCodeSVG
              value={arUrl}
              size={180}
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

          {/* ===== Action Buttons ===== */}
          <div className="w-full flex gap-3">
            {isTouchDevice && hasARSupport ? (
              /* Mobile/Tablet with AR support: Open AR directly */
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleOpen3DViewer}
                >
                  <Monitor className="w-4 h-4" />
                  Open 3D Viewer
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleOpenAR}
                >
                  <ExternalLink className="w-4 h-4" />
                  {isIOS ? "Open AR" : "Open AR"}
                </Button>
              </>
            ) : isTouchDevice && !hasARSupport ? (
              /* Mobile/Tablet without AR support: fallback */
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onClose}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleOpen3DViewer}
                >
                  <Monitor className="w-4 h-4" />
                  Open 3D Viewer
                </Button>
              </>
            ) : (
              /* Desktop: Open 3D viewer */
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onClose}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleOpen3DViewer}
                >
                  <Monitor className="w-4 h-4" />
                  Open 3D Viewer
                </Button>
              </>
            )}
          </div>

          {/* No AR support warning on touch devices */}
          {isTouchDevice && !hasARSupport && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2 w-full">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Your device doesn't support AR. You can still view the model in 3D.</span>
            </div>
          )}

          <p className="text-muted-foreground/60 text-[11px] text-center max-w-xs">
            Model data is encoded directly in the QR — works across devices without sharing storage
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureARModal;
