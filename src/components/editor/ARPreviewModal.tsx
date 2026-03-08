import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Smartphone, Camera, QrCode, Eye } from "lucide-react";
import type { PlacedObject, RoomConfig } from "@/types/editor";

interface ARPreviewModalProps {
  open: boolean;
  onClose: () => void;
  objects: PlacedObject[];
  roomConfig: RoomConfig;
}

const ARPreviewModal = ({ open, onClose, objects, roomConfig }: ARPreviewModalProps) => {
  // Encode layout data into a compact format for the QR URL
  const layoutPayload = {
    room: { w: roomConfig.width, d: roomConfig.depth, h: roomConfig.height },
    objects: objects.map((o) => ({
      id: o.furnitureId,
      n: o.name,
      c: o.category,
      p: o.position,
      r: o.rotation,
      s: o.scale,
      cl: o.color,
      d: o.dimensions,
    })),
  };

  const layoutId = btoa(JSON.stringify(layoutPayload)).slice(0, 32);
  const arViewerUrl = `${window.location.origin}/ar-viewer/${layoutId}`;

  // Store layout in sessionStorage for the AR viewer to pick up
  if (open) {
    try {
      localStorage.setItem(`ar-layout-${layoutId}`, JSON.stringify(layoutPayload));
    } catch {
      // localStorage might be full
    }
  }

  const steps = [
    { icon: Camera, text: "Open camera on your phone" },
    { icon: QrCode, text: "Scan the QR code below" },
    { icon: Eye, text: "View your design in AR" },
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
            Scan this QR code with your phone to view your {objects.length}-object layout in augmented reality.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-soft border border-border/30">
            <QRCodeSVG
              value={arViewerUrl}
              size={200}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="hsl(235, 60%, 52%)"
            />
          </div>

          {/* Layout summary */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-accent/40 rounded-xl px-4 py-2.5">
            <span>{roomConfig.width}m × {roomConfig.depth}m room</span>
            <span className="w-px h-3 bg-border" />
            <span>{objects.length} objects</span>
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

export default ARPreviewModal;
