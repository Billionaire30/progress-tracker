import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useClickSound } from "@/lib/hooks/use-click-sound";

interface AddTaskInputProps {
  onAdd: (label: string) => void;
}

export const AddTaskInput = memo(function AddTaskInput({ onAdd }: AddTaskInputProps) {
  const { playClickSound } = useClickSound();
  const [label, setLabel] = useState("");

  const handleAdd = useCallback(() => {
    if (!label.trim()) return;
    playClickSound();
    onAdd(label);
    setLabel("");
  }, [label, onAdd, playClickSound]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  }, [handleAdd]);

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add a new task..."
        className="flex-1 px-3 py-2 border rounded-md text-sm"
      />
      <Button onClick={handleAdd} size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});
