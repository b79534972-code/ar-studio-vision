import { Eye, Grid3X3, Undo, Redo, Save, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  viewMode: "3d" | "top";
  onToggleView: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onARPreview: () => void;
  onAISuggest: () => void;
  objectCount: number;
}

const EditorToolbar = ({
  viewMode,
  onToggleView,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onARPreview,
  onAISuggest,
  objectCount,
}: EditorToolbarProps) => {
  return (
    <div className="h-11 bg-card border-b border-border/40 flex items-center px-3 gap-1.5 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === "3d" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 gap-1 text-[11px] px-2"
          onClick={() => viewMode !== "3d" && onToggleView()}
        >
          <Eye className="w-3 h-3" /> 3D
        </Button>
        <Button
          variant={viewMode === "top" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 gap-1 text-[11px] px-2"
          onClick={() => viewMode !== "top" && onToggleView()}
        >
          <Grid3X3 className="w-3 h-3" /> Top
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{objectCount} objects</span>

      <div className="flex-1 min-w-2" />

      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] px-2 shrink-0 whitespace-nowrap" onClick={onAISuggest}>
        <Sparkles className="w-3 h-3 text-primary" /> <span className="hidden sm:inline">AI Suggest</span><span className="sm:hidden">AI</span>
      </Button>

      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] px-2 shrink-0 whitespace-nowrap" onClick={onARPreview}>
        <Smartphone className="w-3 h-3" /> <span className="hidden sm:inline">AR Preview</span><span className="sm:hidden">AR</span>
      </Button>

      <Separator orientation="vertical" className="h-5 shrink-0" />

      <Button variant="default" size="sm" className="h-7 gap-1.5 text-[11px] px-3 shrink-0 whitespace-nowrap" onClick={onSave}>
        <Save className="w-3 h-3" /> Save
      </Button>
    </div>
  );
};

export default EditorToolbar;
