"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, RefreshCw, Trash2, Check } from "lucide-react";
import { connectIntegration, disconnectIntegration, getIntegrationsList } from "@/lib/integrations";

export function IntegrationsManager() {
  const { data, setData } = useApp();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  const integrations = getIntegrationsList(data);

  const handleConnect = () => {
    if (!selectedIntegration || !apiKey.trim()) return;

    const updatedData = connectIntegration(data, selectedIntegration, { apiKey });
    setData(updatedData);
    setApiKey("");
    setSelectedIntegration(null);
    setIsConnectOpen(false);
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      const updatedData = disconnectIntegration(data, integrationId);
      setData(updatedData);
    }
  };

  const handleSync = (integrationId: string) => {
    // Trigger sync (in real implementation, this would call the actual sync function)
    console.log(`Syncing ${integrationId}`);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  {integration.connected && integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Connected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSync(integration.id)}
                      title="Sync"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(integration.id)}
                      title="Disconnect"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : (
                  <Dialog open={isConnectOpen && selectedIntegration === integration.id} onOpenChange={(open) => {
                    setIsConnectOpen(open);
                    if (!open) setSelectedIntegration(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        Connect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect to {integration.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="api-key">API Key / Access Token</Label>
                          <Input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                          />
                        </div>
                        <Button onClick={handleConnect} className="w-full">
                          Connect
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
