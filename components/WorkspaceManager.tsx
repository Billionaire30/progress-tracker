"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Copy, Settings, Trash2 } from "lucide-react";
import { createWorkspace, deleteWorkspace, switchWorkspace, updateWorkspace, duplicateWorkspace } from "@/lib/workspaces";

export function WorkspaceManager() {
  const { data, setData } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");

  const workspaces = data.workspaces || [];
  const activeWorkspaceId = data.activeWorkspaceId || "default";

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;

    setData((prevData) => {
      const updatedData = createWorkspace(prevData, newWorkspaceName, newWorkspaceDesc);
      return updatedData;
    });
    setNewWorkspaceName("");
    setNewWorkspaceDesc("");
    setIsCreateOpen(false);
  };

  const handleSwitchWorkspace = (workspaceId: string) => {
    setData((prevData) => {
      const updatedData = switchWorkspace(prevData, workspaceId);
      return updatedData;
    });
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert("Cannot delete the last workspace");
      return;
    }

    if (confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      setData((prevData) => {
        const updatedData = deleteWorkspace(prevData, workspaceId);
        return updatedData;
      });
    }
  };

  const handleDuplicateWorkspace = (workspaceId: string) => {
    setData((prevData) => {
      const updatedData = duplicateWorkspace(prevData, workspaceId);
      return updatedData;
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workspaces</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspace-name">Name</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., Web Development"
                  />
                </div>
                <div>
                  <Label htmlFor="workspace-desc">Description (optional)</Label>
                  <Input
                    id="workspace-desc"
                    value={newWorkspaceDesc}
                    onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                    placeholder="Describe your learning path"
                  />
                </div>
                <Button onClick={handleCreateWorkspace} className="w-full">
                  Create Workspace
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                workspace.id === activeWorkspaceId
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleSwitchWorkspace(workspace.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{workspace.icon || "📁"}</span>
                  <div>
                    <h3 className="font-medium">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground">{workspace.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workspace.id === activeWorkspaceId && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateWorkspace(workspace.id);
                    }}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {workspaces.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(workspace.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
