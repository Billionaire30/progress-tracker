import { useAppData } from "@/lib/useAppData";
import { useToast } from "@/lib/hooks/use-toast";
import { triggerConfetti } from "@/lib/confetti";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useCallback, memo } from "react";

export const PortfolioPanel = memo(function PortfolioPanel() {
  const { data, cyclePortfolio, setData } = useAppData();
  const { toast } = useToast();
  const { playClickSound } = useClickSound();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);

  const filteredPortfolio = useMemo(() =>
    data.portfolio.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [data.portfolio, searchQuery]
  );

  const savePortfolioNotes = useCallback((id: number, notes: string) => {
    const updatedPortfolio = data.portfolio.map((item) =>
      item.id === id ? { ...item, notes } : item
    );
    setData({ ...data, portfolio: updatedPortfolio });
    setEditingNotesId(null);
  }, [data, setData]);

  const handleCycle = useCallback((id: number) => {
    const item = data.portfolio.find((p) => p.id === id);
    if (!item) return;

    const oldStatus = item.status;
    playClickSound();
    cyclePortfolio(id);

    // Show toast if cycling to complete
    const statuses: ("not-started" | "in-progress" | "complete")[] = ["not-started", "in-progress", "complete"];
    const currentIndex = statuses.indexOf(oldStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    if (newStatus === "complete") {
      triggerConfetti();
      toast({
        title: "Portfolio item complete",
        description: `${item.name} has been marked as complete`,
      });
    }
  }, [data.portfolio, cyclePortfolio, toast, playClickSound]);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "in-progress":
        return "In progress";
      default:
        return "Not started";
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Portfolio Progress</CardTitle>
        <div className="mt-2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search portfolio items..."
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredPortfolio.map((item) => (
            <Card key={item.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              {item.image && (
                <div className="h-20 sm:h-24 overflow-hidden relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <StatusPill
                    status={item.status}
                    onClick={() => handleCycle(item.id)}
                    aria-label={`Cycle status for ${item.name}, currently ${getStatusLabel(item.status)}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      playClickSound();
                      setEditingNotesId(item.id);
                    }}
                    aria-label={`Edit notes for ${item.name}`}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <Dialog open={editingNotesId !== null} onOpenChange={() => setEditingNotesId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
          </DialogHeader>
          {editingNotesId !== null && (
            <div className="space-y-4">
              <textarea
                value={data.portfolio.find(p => p.id === editingNotesId)?.notes || ""}
                onChange={(e) => {
                  const updatedPortfolio = data.portfolio.map((item) =>
                    item.id === editingNotesId ? { ...item, notes: e.target.value } : item
                  );
                  setData({ ...data, portfolio: updatedPortfolio });
                }}
                className="w-full min-h-[150px] p-3 border rounded-md text-sm resize-y"
                placeholder="Add your notes here..."
              />
              <Button onClick={() => setEditingNotesId(null)} className="w-full sm:w-auto">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
});
