"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";

interface NotesEditorProps {
  notes?: string;
  onSave: (notes: string) => void;
  title?: string;
}

export const NotesEditor = memo(function NotesEditor({ notes = "", onSave, title = "Notes" }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes);

  useEffect(() => {
    setCurrentNotes(notes);
  }, [notes]);

  const handleSave = useCallback(() => {
    onSave(currentNotes);
    setIsEditing(false);
  }, [currentNotes, onSave]);

  const handleCancel = useCallback(() => {
    setCurrentNotes(notes);
    setIsEditing(false);
  }, [notes]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditing}
              aria-label="Edit notes"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md text-sm resize-y"
              placeholder="Add your notes here..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {notes || "No notes yet. Click the edit button to add notes."}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
