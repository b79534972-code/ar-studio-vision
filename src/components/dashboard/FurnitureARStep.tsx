/**
 * AR Preview step — generates QR code for scanning on mobile.
 */

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, Eye, Ruler, ArrowLeft, Check, Smartphone } from "lucide-react";
import type { FurnitureItem } from "@/types/editor";
import { useIsTouchDevice } from "@/hooks/use-touch-device";

interface FurnitureARStepProps {
  item: FurnitureItem;
  onBack: () => void;
  onDone: () => void;
}

const FurnitureARStep = ({ item, onBack, onDone }: FurnitureARStepProps) => {
  const isTouchDevice = useIsTouchDevice();
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

  // Store payload for viewer
  try {
    localStorage.setItem(`ar-object-${encodedId}`, JSON.stringify(payload));
  } catch { /* storage full */ }

  const handleOpenDirectAR = () => {
    window.location.href = arUrl;
  };

  const steps = isTouchDevice
    ? [
        { icon: Smartphone, text: "Open the AR viewer directly on this device" },
        { icon: Eye, text: "Inspect the furniture model in 3D / AR" },
      ]
    : [
        { icon: Camera, text: "Open camera on your phone" },
        { icon: QrCode, text: "Scan the QR code below" },
        { icon: Eye, text: "View furniture in your space" },
      ];

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {isTouchDevice ? (
        <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Open AR directly on this device</p>
            <p className="text-xs text-muted-foreground">
              You are already on a phone or tablet, so you do not need to scan a QR code.
            </p>
          </div>
          <Button className="w-full gap-2" onClick={handleOpenDirectAR}>
            <Smartphone className="w-4 h-4" /> Open 3D / AR Preview
          </Button>
        </div>
      ) : (
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
      )}

      {/* Furniture info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground bg-accent/40 rounded-xl px-4 py-2.5 w-full">
        <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
        <span className="font-medium text-foreground">{item.name}</span>
        <span className="w-px h-3 bg-border" />
        <Ruler className="w-3 h-3 shrink-0" />
        <span>
          {(item.dimensions.width * 100).toFixed(0)} × {(item.dimensions.depth * 100).toFixed(0)} × {(item.dimensions.height * 100).toFixed(0)} cm
        </span>
      </div>

      {/* Steps */}
      <div className="w-full space-y-2.5">
        {steps.map((s, i) => (
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

      {/* Actions */}
      <div className="flex gap-2 w-full pt-1">
        <Button variant="outline" className="flex-1 gap-1.5" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to 3D
        </Button>
        {isTouchDevice ? (
          <Button className="flex-1 gap-1.5" onClick={handleOpenDirectAR}>
            <Smartphone className="w-3.5 h-3.5" /> Open AR
          </Button>
        ) : (
          <Button className="flex-1 gap-1.5" onClick={onDone}>
            <Check className="w-3.5 h-3.5" /> Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default FurnitureARStep;
