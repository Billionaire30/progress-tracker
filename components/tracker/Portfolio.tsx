"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { PortfolioItem, PortfolioCategory } from "@/types/domain";
import { PORTFOLIO_CATEGORIES } from "@/constants/seedData";

export function Portfolio() {
  const portfolio = useAppStore((state) => state.portfolio);
  const addPortfolioItem = useAppStore((state) => state.addPortfolioItem);
  const updatePortfolioItem = useAppStore((state) => state.updatePortfolioItem);
  const deletePortfolioItem = useAppStore((state) => state.deletePortfolioItem);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    category: 'road-design' as PortfolioCategory,
    title: "",
    description: "",
    link: "",
    tags: [] as string[],
  });
  const [imageDataUrl, setImageDataUrl] = useState("");

  const handleAddItem = () => {
    if (!newItem.title.trim() || !newItem.description.trim()) return;

    addPortfolioItem({
      ...newItem,
      imageDataUrl: imageDataUrl || undefined,
    });

    setNewItem({
      category: 'road-design',
      title: "",
      description: "",
      link: "",
      tags: [],
    });
    setImageDataUrl("");
    setIsAddOpen(false);
  };

  const handleUpdateItem = () => {
    if (!editingItemId || !newItem.title.trim()) return;

    updatePortfolioItem(editingItemId, {
      ...newItem,
      imageDataUrl: imageDataUrl || undefined,
    });

    setEditingItemId(null);
    setNewItem({
      category: 'road-design',
      title: "",
      description: "",
      link: "",
      tags: [],
    });
    setImageDataUrl("");
    setIsEditOpen(false);
  };

  const openEditItem = (item: PortfolioItem) => {
    setEditingItemId(item.id);
    setNewItem({
      category: item.category,
      title: item.title,
      description: item.description,
      link: item.link || "",
      tags: item.tags,
    });
    setImageDataUrl(item.imageDataUrl || "");
    setIsEditOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this portfolio item?")) {
      deletePortfolioItem(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Portfolio
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="item-category">Category</Label>
                  <select
                    id="item-category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as PortfolioCategory })}
                    className="w-full p-2 border rounded-md"
                  >
                    {PORTFOLIO_CATEGORIES.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="item-title">Title *</Label>
                  <Input
                    id="item-title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
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
                <div>
                  <Label htmlFor="item-link">Link (optional)</Label>
                  <Input
                    id="item-link"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="item-tags">Tags (comma-separated)</Label>
                  <Input
                    id="item-tags"
                    value={newItem.tags.join(", ")}
                    onChange={(e) => setNewItem({ ...newItem, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="e.g., CAD, Design, Survey"
                  />
                </div>
                <div>
                  <Label htmlFor="item-image">Image (optional)</Label>
                  <Input
                    id="item-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {imageDataUrl && (
                    <div className="mt-2">
                      <img src={imageDataUrl} alt="Preview" className="w-full h-32 object-cover rounded" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageDataUrl("")}
                      className="mt-1"
                    >
                      Remove image
                    </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} className="flex-1">Add Item</Button>
                  <Button onClick={() => setIsAddOpen(false)} variant="outline" className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No portfolio items yet</p>
            <Button onClick={() => setIsAddOpen(true)}>Add Your First Item</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {PORTFOLIO_CATEGORIES.map((category: any) => {
              const categoryItems = portfolio.filter(p => p.category === category.id);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id}>
                  <h4 className="text-sm font-medium mb-2">{category.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer relative"
                        onClick={() => openEditItem(item)}
                      >
                        {item.imageDataUrl && (
                          <img src={item.imageDataUrl} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
                        )}
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
