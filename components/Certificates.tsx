"use client";

import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Certificate } from "@/lib/data";
import { Award, Plus, ExternalLink, Calendar, X, Tag, Trash2 } from "lucide-react";
import Image from "next/image";
import Magnet from "@/components/Magnet";
import GlareHover from "@/components/GlareHover";

export function Certificates() {
  const { data, setData } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
    title: "",
    issuer: "",
    issueDate: "",
    skills: [],
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const certificates = data.certificates || [];

  const handleAddCertificate = useCallback(() => {
    if (!newCertificate.title || !newCertificate.issuer || !newCertificate.issueDate) return;

    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      title: newCertificate.title,
      issuer: newCertificate.issuer,
      issueDate: newCertificate.issueDate,
      expiryDate: newCertificate.expiryDate,
      credentialId: newCertificate.credentialId,
      credentialUrl: newCertificate.credentialUrl,
      image: newCertificate.image,
      skills: newCertificate.skills || [],
      notes: newCertificate.notes,
    };

    setData({
      ...data,
      certificates: [...certificates, certificate],
    });

    setNewCertificate({ title: "", issuer: "", issueDate: "", skills: [] });
    setUploadedImage(null);
    setIsAddDialogOpen(false);
  }, [newCertificate, certificates, data, setData]);

  const handleDeleteCertificate = useCallback((id: string) => {
    setData({
      ...data,
      certificates: certificates.filter((c) => c.id !== id),
    });
  }, [certificates, data, setData]);

  const handleSkillAdd = useCallback((skill: string) => {
    if (skill.trim() && !newCertificate.skills?.includes(skill.trim())) {
      setNewCertificate({
        ...newCertificate,
        skills: [...(newCertificate.skills || []), skill.trim()],
      });
    }
  }, [newCertificate]);

  const handleSkillRemove = useCallback((skill: string) => {
    setNewCertificate({
      ...newCertificate,
      skills: newCertificate.skills?.filter((s) => s !== skill) || [],
    });
  }, [newCertificate]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        setNewCertificate((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setNewCertificate((prev) => ({ ...prev, image: undefined }));
  }, []);

  useEffect(() => {
    if (!isAddDialogOpen) {
      setUploadedImage(null);
    }
  }, [isAddDialogOpen]);

  if (certificates.length === 0) {
    return (
      <Card className="glass-card">
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Certificate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Certificate Title *</Label>
                    <Input
                      id="title"
                      value={newCertificate.title}
                      onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                      placeholder="e.g., AutoCAD Professional Certification"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuer">Issuer *</Label>
                    <Input
                      id="issuer"
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                      placeholder="e.g., Autodesk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newCertificate.issueDate}
                      onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newCertificate.expiryDate}
                      onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                    <Input
                      id="credentialId"
                      value={newCertificate.credentialId}
                      onChange={(e) => setNewCertificate({ ...newCertificate, credentialId: e.target.value })}
                      placeholder="e.g., CERT-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                    <Input
                      id="credentialUrl"
                      value={newCertificate.credentialUrl}
                      onChange={(e) => setNewCertificate({ ...newCertificate, credentialUrl: e.target.value })}
                      placeholder="https://example.com/certificate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Certificate Image (Optional)</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="cursor-pointer"
                        />
                        {uploadedImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      {uploadedImage && (
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-border">
                          <Image
                            src={uploadedImage}
                            alt="Certificate preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Skills (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSkillAdd(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a skill"]') as HTMLInputElement;
                          if (input) {
                            handleSkillAdd(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {newCertificate.skills && newCertificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newCertificate.skills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                          >
                            <Tag className="h-3 w-3" />
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newCertificate.notes}
                      onChange={(e) => setNewCertificate({ ...newCertificate, notes: e.target.value })}
                      placeholder="Any additional notes about this certificate"
                    />
                  </div>
                  <Button onClick={handleAddCertificate} className="w-full">
                    Add Certificate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Certificates
          <span className="text-sm font-normal text-muted-foreground">
            ({certificates.length})
          </span>
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title *</Label>
                <Input
                  id="title"
                  value={newCertificate.title}
                  onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                  placeholder="e.g., AutoCAD Professional Certification"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer *</Label>
                <Input
                  id="issuer"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  placeholder="e.g., Autodesk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newCertificate.issueDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCertificate.expiryDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                <Input
                  id="credentialId"
                  value={newCertificate.credentialId}
                  onChange={(e) => setNewCertificate({ ...newCertificate, credentialId: e.target.value })}
                  placeholder="e.g., CERT-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                <Input
                  id="credentialUrl"
                  value={newCertificate.credentialUrl}
                  onChange={(e) => setNewCertificate({ ...newCertificate, credentialUrl: e.target.value })}
                  placeholder="https://example.com/certificate"
                />
              </div>
              <div className="space-y-2">
                <Label>Certificate Image (Optional)</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {uploadedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  {uploadedImage && (
                    <div className="relative h-40 w-full rounded-lg overflow-hidden border border-border">
                      <Image
                        src={uploadedImage}
                        alt="Certificate preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSkillAdd(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a skill"]') as HTMLInputElement;
                      if (input) {
                        handleSkillAdd(input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {newCertificate.skills && newCertificate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCertificate.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newCertificate.notes}
                  onChange={(e) => setNewCertificate({ ...newCertificate, notes: e.target.value })}
                  placeholder="Any additional notes about this certificate"
                />
              </div>
              <Button onClick={handleAddCertificate} className="w-full">
                Add Certificate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <Magnet key={cert.id} padding={30} magnetStrength={2} maxOffset={8} scale={1.02} tilt={2}>
              <GlareHover
                variant="streak"
                glareColor="#8b5cf6"
                glareOpacity={0.3}
                glareAngle={-45}
                glareSize={20}
                softness={0.5}
                mode="hover"
                borderRadius="12px"
                className="w-full"
              >
                <Card className="glass-card h-full flex flex-col relative overflow-hidden group">
                  {cert.image && (
                    <div className="h-32 overflow-hidden relative flex-shrink-0">
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        quality={80}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  )}
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                          {cert.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{cert.issuer}</p>
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
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 px-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    </div>
                    {cert.expiryDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cert.credentialId && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">ID: </span>
                        <span className="font-mono">{cert.credentialId}</span>
                      </div>
                    )}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md text-xs"
                          >
                            <Tag className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {cert.credentialUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Credential
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </GlareHover>
            </Magnet>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
