"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, LogOut, X, User, Shield, CheckCircle } from "lucide-react";

export function SimpleAuth() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleSignIn = () => {
    // Simple mock sign in - in production this would use actual auth
    if (email && password) {
      setIsSignedIn(true);
      setUserEmail(email);
      setIsOpen(false);
      setIsAnimating(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserEmail("");
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen && !isSignedIn) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
        title="Sign in"
      >
        <LogIn className="h-4 w-4" />
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <div className="relative group">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
          title={`Signed in as ${userEmail}`}
        >
          <LogOut className="h-4 w-4" />
        </button>
        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-background border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
          <div className="flex items-center gap-2 p-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClickOutside}
    >
      <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
        <Card className="relative shadow-2xl border-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setIsOpen(false); setIsAnimating(false); }}
          className="absolute top-3 right-3 z-10 hover:bg-destructive/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            Sign In
          </CardTitle>
          <p className="text-sm text-muted-foreground">Access your personalized progress tracking</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 h-11"
              />
            </div>
          </div>
          <Button 
            onClick={handleSignIn} 
            className="w-full h-11 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!email || !password}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Demo mode:</span> Any email and password will work. This is for demonstration purposes only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
