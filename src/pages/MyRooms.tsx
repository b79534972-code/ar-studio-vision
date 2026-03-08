import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Plus, Search, MoreHorizontal, Trash2, ArrowRight, ArrowLeft,
  Layers, Clock, Edit, PenTool,
} from "lucide-react";
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
import type { SavedRoom, SavedLayout } from "@/stores/roomStore";
import { cn } from "@/lib/utils";

const MyRooms = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rooms, layouts, removeRoom, addRoom, getLayoutsForRoom, removeLayout } = useRoomStore();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", width: "6", depth: "5", height: "2.8" });
  const [selectedRoom, setSelectedRoom] = useState<SavedRoom | null>(null);

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
    toast({ title: t("rooms.created"), description: `${room.name}` });
    navigate(`/dashboard/editor?roomId=${room.id}`);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    removeRoom(id);
    if (selectedRoom?.id === id) setSelectedRoom(null);
    toast({ title: t("rooms.deleted"), description: `${name} ${t("rooms.removed")}` });
  };

  const handleDeleteLayout = (id: string, name: string) => {
    removeLayout(id);
    toast({ title: t("rooms.deleted"), description: `${name} ${t("rooms.removed")}` });
  };

  const handleOpenEditor = (roomId: string, layoutId?: string) => {
    const url = layoutId
      ? `/dashboard/editor?roomId=${roomId}&layoutId=${layoutId}`
      : `/dashboard/editor?roomId=${roomId}`;
    navigate(url);
  };

  const roomLayouts = selectedRoom ? getLayoutsForRoom(selectedRoom.id) : [];

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

      <AnimatePresence mode="wait">
        {/* ─── Room Detail View ─── */}
        {selectedRoom ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Back + Room info */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setSelectedRoom(null)}>
                <ArrowLeft className="w-3.5 h-3.5" /> {t("rooms.allRooms")}
              </Button>
              <div className="h-5 w-px bg-border/40" />
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold text-foreground">{selectedRoom.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedRoom.config.width}m × {selectedRoom.config.depth}m × {selectedRoom.config.height}m
                </p>
              </div>
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => handleOpenEditor(selectedRoom.id)}>
                <PenTool className="w-3.5 h-3.5" /> {t("rooms.openEditor")}
              </Button>
            </div>

            {/* Layouts list */}
            <div className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">{t("rooms.savedLayouts")}</h3>
                  <span className="text-[10px] text-muted-foreground bg-accent/50 rounded-full px-2 py-0.5">
                    {roomLayouts.length}
                  </span>
                </div>
              </div>

              {roomLayouts.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Layers className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground">{t("rooms.noLayouts")}</p>
                  <p className="text-xs text-muted-foreground/70">{t("rooms.noLayoutsDesc")}</p>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleOpenEditor(selectedRoom.id)}>
                    <PenTool className="w-3 h-3" /> {t("rooms.openEditor")}
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {roomLayouts
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((layout, i) => (
                      <motion.div
                        key={layout.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer group"
                        onClick={() => handleOpenEditor(selectedRoom.id, layout.id)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{layout.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {layout.objects.length} {t("rooms.objects")}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50">·</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(layout.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50 ml-auto">v{layout.version}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); handleOpenEditor(selectedRoom.id, layout.id); }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteLayout(layout.id, layout.name); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ─── Rooms Grid ─── */
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Home className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {rooms.length === 0 ? t("rooms.empty") : t("rooms.noResults")}
                </p>
                {rooms.length === 0 && (
                  <Button variant="hero" size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
                    <Plus className="w-3.5 h-3.5" /> {t("rooms.create")}
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
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="h-36 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center relative">
                        <Home className="w-10 h-10 text-muted-foreground/30" />
                        {layoutCount > 0 && (
                          <div className="absolute top-2.5 right-2.5 bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-foreground">{layoutCount}</span>
                          </div>
                        )}
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
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditor(room.id); }}>
                                <PenTool className="w-3.5 h-3.5 mr-2" /> {t("rooms.openEditor")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}>
                                <Layers className="w-3.5 h-3.5 mr-2" /> {t("rooms.viewLayouts")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id, room.name); }}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> {t("rooms.delete")}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rooms.createNew")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("rooms.roomName")}</Label>
              <Input
                value={newRoom.name}
                onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
                placeholder={t("rooms.roomNamePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("rooms.width")}</Label>
                <Input type="number" value={newRoom.width} onChange={(e) => setNewRoom((p) => ({ ...p, width: e.target.value }))} min="1" max="20" step="0.5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("rooms.depth")}</Label>
                <Input type="number" value={newRoom.depth} onChange={(e) => setNewRoom((p) => ({ ...p, depth: e.target.value }))} min="1" max="20" step="0.5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("rooms.height")}</Label>
                <Input type="number" value={newRoom.height} onChange={(e) => setNewRoom((p) => ({ ...p, height: e.target.value }))} min="2" max="6" step="0.1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("rooms.cancel")}</Button>
            <Button onClick={handleCreate} disabled={!newRoom.name.trim()}>{t("rooms.createOpen")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRooms;
