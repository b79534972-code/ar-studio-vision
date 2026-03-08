import { Trash2, Copy, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { PlacedObject, RoomConfig } from "@/types/editor";

interface EditorPropertiesPanelProps {
  selectedObject: PlacedObject | null;
  roomConfig: RoomConfig;
  onUpdateObject: (id: string, updates: Partial<PlacedObject>) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onUpdateRoom: (updates: Partial<RoomConfig>) => void;
}

const EditorPropertiesPanel = ({
  selectedObject,
  roomConfig,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onUpdateRoom,
}: EditorPropertiesPanelProps) => {

  if (!selectedObject) {
    return (
      <div className="w-full lg:w-64 bg-card lg:border-l border-border/40 flex flex-col h-full">
        <div className="p-3 border-b border-border/30">
          <h3 className="font-display text-sm font-bold text-foreground">Room Settings</h3>
        </div>
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Room Width (m)</Label>
            <Input
              type="number"
              value={roomConfig.width}
              onChange={(e) => onUpdateRoom({ width: parseFloat(e.target.value) || 4 })}
              className="h-8 text-xs"
              step={0.5}
              min={2}
              max={20}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Room Depth (m)</Label>
            <Input
              type="number"
              value={roomConfig.depth}
              onChange={(e) => onUpdateRoom({ depth: parseFloat(e.target.value) || 4 })}
              className="h-8 text-xs"
              step={0.5}
              min={2}
              max={20}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Room Height (m)</Label>
            <Input
              type="number"
              value={roomConfig.height}
              onChange={(e) => onUpdateRoom({ height: parseFloat(e.target.value) || 2.8 })}
              className="h-8 text-xs"
              step={0.1}
              min={2}
              max={5}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">Wall Color</Label>
            <input
              type="color"
              value={roomConfig.wallColor}
              onChange={(e) => onUpdateRoom({ wallColor: e.target.value })}
              className="w-full h-8 rounded-lg cursor-pointer border border-border/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Floor Color</Label>
            <input
              type="color"
              value={roomConfig.floorColor}
              onChange={(e) => onUpdateRoom({ floorColor: e.target.value })}
              className="w-full h-8 rounded-lg cursor-pointer border border-border/40"
            />
          </div>
        </div>
        <div className="flex-1" />
        <div className="p-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground text-center">Select an object to edit properties</p>
        </div>
      </div>
    );
  }

  const obj = selectedObject;

  return (
    <div className="w-64 bg-card border-l border-border/40 flex flex-col h-full">
      <div className="p-3 border-b border-border/30">
        <h3 className="font-display text-sm font-bold text-foreground">Properties</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{obj.category} — {obj.name}</p>
      </div>

      <div className="p-3 space-y-4 flex-1 overflow-y-auto">
        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Position</Label>
          {(["X", "Y", "Z"] as const).map((axis, i) => (
            <div key={axis} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-3">{axis}</span>
              <Input
                type="number"
                value={obj.position[i].toFixed(2)}
                onChange={(e) => {
                  const pos = [...obj.position] as [number, number, number];
                  pos[i] = parseFloat(e.target.value) || 0;
                  onUpdateObject(obj.id, { position: pos });
                }}
                className="h-7 text-xs flex-1"
                step={0.1}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Rotation Y */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Rotation (°)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[obj.rotation[1]]}
              min={0}
              max={360}
              step={15}
              onValueChange={([v]) => {
                const rot = [...obj.rotation] as [number, number, number];
                rot[1] = v;
                onUpdateObject(obj.id, { rotation: rot });
              }}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground w-8 text-right">{obj.rotation[1]}°</span>
          </div>
        </div>

        <Separator />

        {/* Scale */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Scale</Label>
          <Slider
            value={[obj.scale[0]]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([v]) => {
              onUpdateObject(obj.id, { scale: [v, v, v] });
            }}
          />
          <p className="text-[10px] text-muted-foreground">{(obj.scale[0] * 100).toFixed(0)}%</p>
        </div>

        <Separator />

        {/* Color */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Color</Label>
          <input
            type="color"
            value={obj.color}
            onChange={(e) => onUpdateObject(obj.id, { color: e.target.value })}
            className="w-full h-8 rounded-lg cursor-pointer border border-border/40"
          />
        </div>

        <Separator />

        {/* Dimensions display */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Dimensions</Label>
          <p className="text-[10px] text-muted-foreground">
            {(obj.dimensions.width * obj.scale[0] * 100).toFixed(0)} ×
            {(obj.dimensions.depth * obj.scale[2] * 100).toFixed(0)} ×
            {(obj.dimensions.height * obj.scale[1] * 100).toFixed(0)} cm
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border/30 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={() => onDuplicateObject(obj.id)}
          >
            <Copy className="w-3 h-3" /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={() => {
              const rot = [...obj.rotation] as [number, number, number];
              rot[1] = (rot[1] + 90) % 360;
              onUpdateObject(obj.id, { rotation: rot });
            }}
          >
            <RotateCw className="w-3 h-3" /> Rotate
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-1.5 text-xs h-8"
          onClick={() => onDeleteObject(obj.id)}
        >
          <Trash2 className="w-3 h-3" /> Delete Object
        </Button>
      </div>
    </div>
  );
};

export default EditorPropertiesPanel;
