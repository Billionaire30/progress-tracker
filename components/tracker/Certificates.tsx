"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Award, Plus, Trash2, FileText } from "lucide-react";
import { Certificate } from "@/types/domain";

export function Certificates() {
  const certificates = useAppStore((state) => state.certificates);
  const addCertificate = useAppStore((state) => state.addCertificate);
  const updateCertificate = useAppStore((state) => state.updateCertificate);
  const deleteCertificate = useAppStore((state) => state.deleteCertificate);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    title: "",
    issuer: "",
    date: "",
  });
  const [fileDataUrl, setFileDataUrl] = useState("");

  const handleAddCertificate = useCallback(() => {
    if (!newCertificate.title || !newCertificate.issuer || !newCertificate.date) return;

    addCertificate({
      ...newCertificate,
      fileDataUrl: fileDataUrl || undefined,
    });

    setNewCertificate({ title: "", issuer: "", date: "" });
    setFileDataUrl("");
    setIsAddOpen(false);
  }, [newCertificate, fileDataUrl, addCertificate]);

  const handleDeleteCertificate = useCallback((id: string) => {
    deleteCertificate(id);
  }, [deleteCertificate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No certificates added yet</p>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certificate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Certificate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Certificate Title *</Label>
                    <Input
                      id="title"
                      value={newCertificate.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                      placeholder="e.g., AutoCAD Professional Certification"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer">Issuer *</Label>
                    <Input
                      id="issuer"
                      value={newCertificate.issuer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                      placeholder="e.g., Autodesk"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newCertificate.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file">Upload File (optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e)}
                    />
                    {fileDataUrl && (
                      <div className="mt-2">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm">File attached</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileDataUrl("")}
                          className="ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleAddCertificate} className="w-full">Add Certificate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Certificates
          <span className="text-sm font-normal text-muted-foreground">
            ({certificates.length})
          </span>
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Certificate Title *</Label>
                <Input
                  id="title"
                  value={newCertificate.title}
                  onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                  placeholder="e.g., AutoCAD Professional Certification"
                />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer *</Label>
                <Input
                  id="issuer"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  placeholder="e.g., Autodesk"
                />
              </div>
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newCertificate.date}
                  onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="file">Upload File (optional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e)}
                />
                {fileDataUrl && (
                  <div className="mt-2">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">File attached</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFileDataUrl("")}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={handleAddCertificate} className="w-full">Add Certificate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-2">{cert.title}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCertificate(cert.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Issued: {new Date(cert.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
