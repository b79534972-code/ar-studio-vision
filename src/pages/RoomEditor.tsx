import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EditorFurniturePanel from "@/components/editor/EditorFurniturePanel";
import EditorPropertiesPanel from "@/components/editor/EditorPropertiesPanel";
import EditorToolbar from "@/components/editor/EditorToolbar";
import RoomCanvas3D from "@/components/editor/RoomCanvas3D";
import ARPreviewModal from "@/components/editor/ARPreviewModal";
import type { PlacedObject, RoomConfig, FurnitureItem } from "@/types/editor";

const DEFAULT_ROOM: RoomConfig = {
  width: 6,
  depth: 5,
  height: 2.8,
  wallColor: "#F5F5F4",
  floorColor: "#D6D3D1",
};

const RoomEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(DEFAULT_ROOM);
  const [viewMode, setViewMode] = useState<"3d" | "top">("3d");
  const [showARModal, setShowARModal] = useState(false);

  // Load scanned room config if coming from Room Scan AI
  useEffect(() => {
    if (searchParams.get("source") === "scan") {
      try {
        const stored = sessionStorage.getItem("scanned-room");
        if (stored) {
          const scanned = JSON.parse(stored);
          setRoomConfig((prev) => ({ ...prev, ...scanned }));
          sessionStorage.removeItem("scanned-room");
          toast({ title: "Room Loaded", description: "Scanned room structure applied" });
        }
      } catch { /* ignore */ }
    }
  }, [searchParams, toast]);

  const selectedObject = objects.find((o) => o.id === selectedId) || null;

  const handleAddFurniture = useCallback((item: FurnitureItem) => {
    const newObj: PlacedObject = {
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      furnitureId: item.id,
      name: item.name,
      category: item.category,
      position: [
        (Math.random() - 0.5) * (roomConfig.width * 0.5),
        0,
        (Math.random() - 0.5) * (roomConfig.depth * 0.5),
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: item.color,
      dimensions: item.dimensions,
    };
    setObjects((prev) => [...prev, newObj]);
    setSelectedId(newObj.id);
    toast({ title: "Added", description: `${item.name} placed in room` });
  }, [roomConfig, toast]);

  const handleUpdateObject = useCallback((id: string, updates: Partial<PlacedObject>) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  const handleDeleteObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    setSelectedId(null);
    toast({ title: "Deleted", description: "Object removed from room" });
  }, [toast]);

  const handleDuplicateObject = useCallback((id: string) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    const dup: PlacedObject = {
      ...obj,
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      position: [obj.position[0] + 0.5, obj.position[1], obj.position[2] + 0.5],
    };
    setObjects((prev) => [...prev, dup]);
    setSelectedId(dup.id);
    toast({ title: "Duplicated", description: `${obj.name} duplicated` });
  }, [objects, toast]);

  const handleSave = useCallback(() => {
    toast({ title: "Layout Saved", description: `${objects.length} objects in room` });
  }, [objects, toast]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-card border-b border-border/40 flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <div className="h-5 w-px bg-border/40" />
        <h1 className="font-display text-sm font-bold text-foreground">Room Editor</h1>
        <span className="text-[10px] text-muted-foreground">
          {roomConfig.width}m × {roomConfig.depth}m
        </span>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "3d" ? "top" : "3d"))}
        onSave={handleSave}
        onUndo={() => {}}
        onRedo={() => {}}
        onARPreview={() => setShowARModal(true)}
        onAISuggest={() => toast({ title: "AI Suggest", description: "Analyzing room layout…" })}
        objectCount={objects.length}
      />

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        <EditorFurniturePanel onAddFurniture={handleAddFurniture} />

        <div className="flex-1 p-2">
          <RoomCanvas3D
            objects={objects}
            roomConfig={roomConfig}
            selectedId={selectedId}
            onSelectObject={setSelectedId}
            viewMode={viewMode}
          />
        </div>

        <EditorPropertiesPanel
          selectedObject={selectedObject}
          roomConfig={roomConfig}
          onUpdateObject={handleUpdateObject}
          onDeleteObject={handleDeleteObject}
          onDuplicateObject={handleDuplicateObject}
          onUpdateRoom={(updates) => setRoomConfig((prev) => ({ ...prev, ...updates }))}
        />
      </div>
    </div>
  );
};

export default RoomEditor;
