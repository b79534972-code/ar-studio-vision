import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Plus, Search, MoreHorizontal, Trash2, Edit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoomStore } from "@/hooks/useRoomStore";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { RoomConfig } from "@/types/editor";

const MyRooms = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rooms, removeRoom, addRoom, getLayoutsForRoom } = useRoomStore();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", width: "6", depth: "5", height: "2.8" });

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newRoom.name.trim()) return;
    const config: RoomConfig = {
      width: parseFloat(newRoom.width) || 6,
      depth: parseFloat(newRoom.depth) || 5,
      height: parseFloat(newRoom.height) || 2.8,
      wallColor: "#F5F5F4",
      floorColor: "#D6D3D1",
    };
    const room = addRoom(newRoom.name.trim(), config);
    setShowCreate(false);
    setNewRoom({ name: "", width: "6", depth: "5", height: "2.8" });
    toast({ title: "Room Created", description: `${room.name} has been created` });
    // Navigate to editor with room id
    navigate(`/dashboard/editor?roomId=${room.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    removeRoom(id);
    toast({ title: "Deleted", description: `${name} removed` });
  };

  const handleOpen = (roomId: string) => {
    navigate(`/dashboard/editor?roomId=${roomId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t("rooms.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("rooms.subtitle")}</p>
        </div>
        <Button variant="hero" size="sm" className="gap-1.5 w-full sm:w-auto" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" /> {t("rooms.create")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rooms.search")}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Home className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {rooms.length === 0 ? "No rooms yet. Create your first room to get started!" : "No rooms match your search"}
          </p>
          {rooms.length === 0 && (
            <Button variant="hero" size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" /> Create Room
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
          {filtered.map((room, i) => {
            const layoutCount = getLayoutsForRoom(room.id).length;
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden hover:shadow-elevated transition-shadow cursor-pointer group"
                onClick={() => handleOpen(room.id)}
              >
                <div className="h-36 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                  <Home className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground text-sm">{room.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen(room.id); }}>
                          <ArrowRight className="w-3.5 h-3.5 mr-2" /> Open in Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(room.id, room.name); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {room.config.width}m × {room.config.depth}m × {room.config.height}m
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {layoutCount} {t("rooms.layouts")} · {new Date(room.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input
                value={newRoom.name}
                onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Living Room"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Width (m)</Label>
                <Input
                  type="number"
                  value={newRoom.width}
                  onChange={(e) => setNewRoom((p) => ({ ...p, width: e.target.value }))}
                  min="1" max="20" step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Depth (m)</Label>
                <Input
                  type="number"
                  value={newRoom.depth}
                  onChange={(e) => setNewRoom((p) => ({ ...p, depth: e.target.value }))}
                  min="1" max="20" step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Height (m)</Label>
                <Input
                  type="number"
                  value={newRoom.height}
                  onChange={(e) => setNewRoom((p) => ({ ...p, height: e.target.value }))}
                  min="2" max="6" step="0.1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newRoom.name.trim()}>Create & Open Editor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRooms;
