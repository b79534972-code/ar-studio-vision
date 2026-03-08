import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EditorFurniturePanel from "@/components/editor/EditorFurniturePanel";
import EditorPropertiesPanel from "@/components/editor/EditorPropertiesPanel";
import EditorToolbar from "@/components/editor/EditorToolbar";
import RoomCanvas3D from "@/components/editor/RoomCanvas3D";
import ARPreviewModal from "@/components/editor/ARPreviewModal";
import AIOptimizePanel from "@/components/editor/AIOptimizePanel";
import { roomStore } from "@/stores/roomStore";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlacedObject, RoomConfig, FurnitureItem } from "@/types/editor";

const DEFAULT_ROOM: RoomConfig = {
  width: 6,
  depth: 5,
  height: 2.8,
  wallColor: "#F5F5F4",
  floorColor: "#D6D3D1",
};

const MAX_HISTORY = 50;

const RoomEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(DEFAULT_ROOM);
  const [viewMode, setViewMode] = useState<"3d" | "top">("3d");
  const [showARModal, setShowARModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const { usage, useCredit } = useSubscription();
  // Room/layout context
  const roomId = searchParams.get("roomId");
  const layoutId = searchParams.get("layoutId");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomId);
  const [roomName, setRoomName] = useState("Untitled Room");

  const [editingName, setEditingName] = useState(false);

  // ─── Load existing room / layout ───
  useEffect(() => {
    if (roomId) {
      const room = roomStore.getRooms().find((r) => r.id === roomId);
      if (room) {
        setRoomConfig(room.config);
        setRoomName(room.name);
        setCurrentRoomId(room.id);
      }

      // Load specific layout or the latest one for this room
      if (layoutId) {
        const layout = roomStore.getLayouts().find((l) => l.id === layoutId);
        if (layout) setObjects(layout.objects);
      } else {
        const roomLayouts = roomStore.getLayoutsForRoom(roomId);
        if (roomLayouts.length > 0) {
          // Load most recent layout
          const latest = roomLayouts.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setObjects(latest.objects);
        }
      }
    }
  }, [roomId, layoutId]);

  // ─── Undo / Redo ───
  const historyRef = useRef<PlacedObject[][]>([[]]);
  const historyIndexRef = useRef(0);
  const isDraggingRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback((newObjects: PlacedObject[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(newObjects);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    setObjects(historyRef.current[historyIndexRef.current]);
    setSelectedId(null);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    setObjects(historyRef.current[historyIndexRef.current]);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  // Load scanned room config
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
    const newObjects = [...objects, newObj];
    setObjects(newObjects);
    pushHistory(newObjects);
    setSelectedId(newObj.id);
    toast({ title: "Added", description: `${item.name} placed in room` });
  }, [roomConfig, toast, objects, pushHistory]);

  const handleUpdateObject = useCallback((id: string, updates: Partial<PlacedObject>) => {
    setObjects((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
      if (!isDraggingRef.current) pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    pushHistory(objects);
  }, [objects, pushHistory]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDeleteObject = useCallback((id: string) => {
    const newObjects = objects.filter((o) => o.id !== id);
    setObjects(newObjects);
    pushHistory(newObjects);
    setSelectedId(null);
    toast({ title: "Deleted", description: "Object removed from room" });
  }, [toast, objects, pushHistory]);

  const handleDuplicateObject = useCallback((id: string) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    const dup: PlacedObject = {
      ...obj,
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      position: [obj.position[0] + 0.5, obj.position[1], obj.position[2] + 0.5],
    };
    const newObjects = [...objects, dup];
    setObjects(newObjects);
    pushHistory(newObjects);
    setSelectedId(dup.id);
    toast({ title: "Duplicated", description: `${obj.name} duplicated` });
  }, [objects, toast, pushHistory]);

  const handleSave = useCallback(() => {
    // Create or update room
    let rId = currentRoomId;
    if (!rId) {
      const room = roomStore.addRoom(roomName, roomConfig);
      rId = room.id;
      setCurrentRoomId(rId);
    } else {
      roomStore.updateRoom(rId, { name: roomName, config: roomConfig });
    }

    // Save layout
    const layoutName = `${roomName} Layout`;
    const saved = roomStore.saveLayout(rId, layoutName, objects);

    toast({
      title: "Layout Saved",
      description: `${objects.length} objects saved`,
    });
  }, [objects, roomConfig, currentRoomId, roomName, toast]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-card border-b border-border/40 flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate("/dashboard/rooms")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <div className="h-5 w-px bg-border/40" />
        {editingName ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
              onBlur={() => setEditingName(false)}
              className="font-display text-sm font-bold text-foreground bg-transparent border-b border-primary outline-none w-36"
            />
            <button onClick={() => setEditingName(false)} className="text-primary">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors group"
          >
            <h1 className="font-display text-sm font-bold text-foreground">{roomName}</h1>
            <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        <span className="text-[10px] text-muted-foreground">
          {roomConfig.width}m × {roomConfig.depth}m
        </span>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "3d" ? "top" : "3d"))}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onARPreview={() => setShowARModal(true)}
        onAISuggest={() => setShowAIPanel(true)}
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
            onUpdateObject={handleUpdateObject}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
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

        {/* AI Optimize Panel */}
        <AIOptimizePanel
          open={showAIPanel}
          onClose={() => setShowAIPanel(false)}
          objects={objects}
          roomConfig={roomConfig}
          creditsRemaining={usage.aiCreditsTotal - usage.aiCreditsUsed}
          useCredit={useCredit}
          onApplySuggestion={(updated) => {
            setObjects(updated);
            pushHistory(updated);
            toast({ title: "AI Applied", description: "Suggestion applied to layout" });
          }}
        />
      </div>

      {/* AR Preview Modal */}
      <ARPreviewModal
        open={showARModal}
        onClose={() => setShowARModal(false)}
        objects={objects}
        roomConfig={roomConfig}
      />
    </div>
  );
};

export default RoomEditor;
