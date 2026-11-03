"use client";

import { useAppData } from "@/lib/useAppData";
import { useToast } from "@/lib/hooks/use-toast";
import { triggerConfetti } from "@/lib/confetti";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useCallback, memo } from "react";

export const PortfolioPanel = memo(function PortfolioPanel() {
  const { data, cyclePortfolio, setData } = useAppData();
  const { toast } = useToast();
  const { playClickSound } = useClickSound();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "" });

  const filteredPortfolio = useMemo(() =>
    data.portfolio.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [data.portfolio, searchQuery]
  );

  const savePortfolioNotes = useCallback((id: number, notes: string) => {
    setData((prevData) => {
      const updatedPortfolio = prevData.portfolio.map((item) =>
        item.id === id ? { ...item, notes } : item
      );
      return { ...prevData, portfolio: updatedPortfolio };
    });
    setEditingNotesId(null);
  }, [setData]);

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

  const handleAddItem = useCallback(() => {
    if (!newItem.name.trim() || !newItem.description.trim()) return;

    const newItemData = {
      id: Date.now(),
      name: newItem.name,
      description: newItem.description,
      status: "not-started" as const,
      image: undefined as string | undefined,
      notes: "",
    };

    setData((prevData) => ({
      ...prevData,
      portfolio: [...prevData.portfolio, newItemData],
    }));

    setNewItem({ name: "", description: "", tags: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Portfolio item added",
      description: `${newItem.name} has been added to your portfolio`,
    });
  }, [newItem, setData, toast]);

  return (
    <Card className="glass-card card-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">Portfolio Progress</CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="button-premium">
            <Edit2 className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="mt-2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search portfolio items..."
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 stagger-children">
          {filteredPortfolio.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden border p-0 rounded-2xl glass-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              onClick={() => setSelectedItem(item.id)}
            >
              {item.image && (
                <div className="h-20 sm:h-24 overflow-hidden relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm group-hover:text-primary transition-colors">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <StatusPill
                    status={item.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCycle(item.id);
                    }}
                    aria-label={`Cycle status for ${item.name}, currently ${getStatusLabel(item.status)}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      setEditingNotesId(item.id);
                      setNotesValue(item.notes || "");
                    }}
                    aria-label={`Edit notes for ${item.name}`}
                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:scale-110 transition-all"
                  >
                    <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={editingNotesId !== null} onOpenChange={() => setEditingNotesId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
          </DialogHeader>
          {editingNotesId !== null && (
            <div className="space-y-4">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                className="w-full min-h-[150px] p-3 border rounded-md text-sm resize-y transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                placeholder="Add your notes here..."
              />
              <div className="flex gap-2">
                <Button onClick={() => {
                  savePortfolioNotes(editingNotesId, notesValue);
                }} className="flex-1 sm:w-auto button-premium">Save</Button>
                <Button onClick={() => setEditingNotesId(null)} variant="outline" className="flex-1 sm:w-auto">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem && data.portfolio.find(p => p.id === selectedItem)?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (() => {
            const item = data.portfolio.find(p => p.id === selectedItem);
            if (!item) return null;
            return (
              <div className="space-y-4">
                {item.image && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Portfolio Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Bridge Design Project"
              />
            </div>
            <div>
              <Label htmlFor="item-description">Description *</Label>
              <textarea
                id="item-description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full min-h-[100px] p-3 border rounded-md text-sm resize-y"
                placeholder="Describe your project..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1 button-premium">Add Item</Button>
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
