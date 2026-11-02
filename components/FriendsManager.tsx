"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Mail,
  Loader2,
  Globe,
  Lock,
  Shield,
  Trash2,
  Clock,
  Trophy,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingFriendRequests,
  getFriends,
  getFriendsProfiles,
} from "@/lib/friends";
import { Friend, FriendRequest, PublicProfile } from "@/lib/data";
import { useApp } from "@/lib/context";

export function FriendsManager() {
  const { user } = useAuth();
  const { data, setData } = useApp();
  const [activeTab, setActiveTab] = useState("friends");
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFriendsData();
  }, [user]);

  const loadFriendsData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [requests, friendsList, profiles] = await Promise.all([
        getPendingFriendRequests(),
        getFriends(),
        getFriendsProfiles(),
      ]);
      setPendingRequests(requests);
      setFriends(friendsList);
      setFriendsProfiles(profiles);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!emailInput.trim()) {
      setMessage({ type: "error", text: "Please enter an email address" });
      return;
    }

    setIsSending(true);
    setMessage(null);

    const result = await sendFriendRequest(emailInput.trim());

    if (result.success) {
      setMessage({ type: "success", text: "Friend request sent!" });
      setEmailInput("");
    } else {
      setMessage({ type: "error", text: result.error || "Failed to send request" });
    }

    setIsSending(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      setMessage({ type: "success", text: "Friend added!" });
      loadFriendsData();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to accept request" });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await rejectFriendRequest(requestId);
    if (result.success) {
      setMessage({ type: "success", text: "Request rejected" });
      loadFriendsData();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to reject request" });
    }
  };

  const handleRemoveFriend = async (friendUserId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) {
      return;
    }

    const result = await removeFriend(friendUserId);
    if (result.success) {
      setMessage({ type: "success", text: "Friend removed" });
      loadFriendsData();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to remove friend" });
    }
  };

  const handleProfileVisibilityChange = (visibility: "public" | "friends-only" | "private") => {
    setData((prev) => ({
      ...prev,
      profileVisibility: visibility,
    }));
    setMessage({ type: "success", text: "Profile visibility updated" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Mail className="h-4 w-4" />
            Add
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4 mt-4">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No friends yet</p>
              <p className="text-sm">Add friends to compete and track each other's progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => {
                const profile = friendsProfiles.find((p) => p.userId === friend.userId);
                return (
                  <Card key={friend.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {friend.photoURL ? (
                            <img
                              src={friend.photoURL}
                              alt={friend.displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{friend.displayName}</p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile && (
                            <div className="text-right mr-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Trophy className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium">{profile.level}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                <span>{profile.overallProgress}%</span>
                              </div>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFriend(friend.userId)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {request.fromPhotoURL ? (
                          <img
                            src={request.fromPhotoURL}
                            alt={request.fromDisplayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{request.fromDisplayName}</p>
                          <p className="text-xs text-muted-foreground">{request.fromEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="gap-1"
                        >
                          <UserCheck className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          className="gap-1 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <UserX className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Friend by Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Friend's Email</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendRequest()}
                  />
                  <Button onClick={handleSendRequest} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your friend must have the app installed and be signed in to receive your request.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => handleProfileVisibilityChange("public")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    data.profileVisibility === "public"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone can see your progress
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleProfileVisibilityChange("friends-only")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    data.profileVisibility === "friends-only"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Friends Only</p>
                      <p className="text-xs text-muted-foreground">
                        Only your friends can see your progress
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleProfileVisibilityChange("private")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    data.profileVisibility === "private"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-xs text-muted-foreground">
                        No one can see your progress
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
