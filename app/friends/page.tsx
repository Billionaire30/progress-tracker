"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useApp } from "@/lib/context";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  Activity,
  Zap,
  Award,
  Loader2,
  Users,
  Clock,
  Flame,
  Medal,
  Crown,
  MessageCircle,
} from "lucide-react";
import { getFriends, getFriendsProfiles } from "@/lib/friends";
import { Friend, PublicProfile, Conversation, Message } from "@/lib/data";
import { getCurrentWeekNumber } from "@/lib/week";
import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  subscribeToMessages,
  subscribeToConversations,
} from "@/lib/messaging";
import { MessagingModal } from "@/components/messaging/MessagingModal";
import { ConversationList } from "@/components/messaging/ConversationList";

export default function FriendsPage() {
  const { user } = useAuth();
  const { data } = useApp();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);

  useEffect(() => {
    loadFriendsData();
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations((convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const msgs = await getMessages(selectedConversation.id);
      setMessages(msgs);
    };

    loadMessages();

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const loadFriendsData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [friendsList, profiles] = await Promise.all([getFriends(), getFriendsProfiles()]);
      setFriends(friendsList);
      setFriendsProfiles(profiles);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate current user's stats
  const currentProfile: PublicProfile = {
    userId: user?.uid || "you",
    displayName: user?.displayName || "You",
    photoURL: user?.photoURL || undefined,
    overallProgress: Math.round(
      ((data.months.filter((m) => m.status === "complete").length +
        data.portfolio.filter((p) => p.status === "complete").length +
        data.competencyChecklist.filter((c) => c.done).length) /
        (12 + 5 + 17)) *
        100
    ),
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    totalHours: data.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0),
    level: data.gamification?.level || 1,
    totalXP: data.gamification?.totalXP || 0,
    badges: data.gamification?.badges || [],
    monthsCompleted: data.months.filter((m) => m.status === "complete").length,
    lastUpdated: data.lastUpdated,
  };

  // Combine all profiles for leaderboard
  const allProfiles = [...friendsProfiles, currentProfile].sort((a, b) => {
    // Sort by total XP first, then by level
    if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
    return b.level - a.level;
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
  };

  // Messaging handlers
  const handleStartConversation = async (friendUserId: string) => {
    const result = await getOrCreateConversation(friendUserId);
    if (result.success && result.conversationId) {
      // Create a temporary conversation object if not in state
      const conv = conversations.find((c) => c.id === result.conversationId) || {
        id: result.conversationId,
        participants: [user?.uid || "", friendUserId],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isArchived: false,
        typingUsers: [],
      };
      setSelectedConversation(conv);
      setIsMessagingModalOpen(true);
    } else if (result.error) {
      alert(result.error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    const friendId = selectedConversation.participants.find((id) => id !== user.uid);
    if (!friendId) return;

    const result = await sendMessage(
      selectedConversation.id,
      friendId,
      content
    );

    if (!result.success) {
      alert(result.error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      setIsMessagingModalOpen(true);
    }
  };



  const getFriendName = (friendId: string) => {
    // Check friends list first
    const friend = friends.find((f) => f.userId === friendId);
    if (friend) return friend.displayName;

    // Check profiles (includes leaderboard users)
    const profile = friendsProfiles.find((p) => p.userId === friendId);
    if (profile) return profile.displayName;

    // Check if it's the current user
    if (friendId === user?.uid) return user.displayName || "You";

    return "Unknown";
  };

  const getFriendPhoto = (friendId: string) => {
    // Check friends list first
    const friend = friends.find((f) => f.userId === friendId);
    if (friend) return friend.photoURL;

    // Check profiles (includes leaderboard users)
    const profile = friendsProfiles.find((p) => p.userId === friendId);
    if (profile) return profile.photoURL;

    // Check if it's the current user
    if (friendId === user?.uid) return user.photoURL;

    return undefined;
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to sign in to view friends and leaderboards
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <Header />

      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl relative" role="main">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Friends & Competition</h1>
          <p className="text-muted-foreground">
            Compare your progress with friends, message them, and stay motivated together
          </p>
        </div>

        {friends.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No Friends Yet</h2>
              <p className="text-muted-foreground mb-6">
                Add friends to compete and track each other's progress
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Go to Home to Add Friends
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="streaks" className="gap-2">
                <Flame className="h-4 w-4" />
                Streaks
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Overall Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allProfiles.map((profile, index) => (
                      <div
                        key={profile.userId}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          profile.userId === user.uid
                            ? "bg-primary/10 border-primary"
                            : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(index)}
                        </div>
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL}
                            alt={profile.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{profile.displayName}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Level {profile.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {profile.totalXP} XP
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {profile.overallProgress}%
                          </div>
                          <div className="text-xs text-muted-foreground">Overall</div>
                          {profile.userId !== user?.uid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleStartConversation(profile.userId)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Overall Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">
                                {profile.displayName}
                              </span>
                              <span className="text-sm font-bold">{profile.overallProgress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                                style={{ width: `${profile.overallProgress}%` }}
                              />
                            </div>
                          </div>
                          {profile.userId !== user?.uid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() => handleStartConversation(profile.userId)}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Months Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">
                                {profile.displayName}
                              </span>
                              <span className="text-sm font-bold">{profile.monthsCompleted}/12</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${(profile.monthsCompleted / 12) * 100}%` }}
                              />
                            </div>
                          </div>
                          {profile.userId !== user?.uid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() => handleStartConversation(profile.userId)}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Total Hours Logged
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {profile.displayName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{profile.totalHours.toFixed(1)}h</span>
                            {profile.userId !== user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartConversation(profile.userId)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Badges Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {profile.displayName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{profile.badges.length}</span>
                            {profile.userId !== user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartConversation(profile.userId)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {profile.displayName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold flex items-center gap-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              {profile.currentStreak} days
                            </span>
                            {profile.userId !== user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartConversation(profile.userId)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Longest Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allProfiles.map((profile) => (
                        <div key={profile.userId} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {profile.displayName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {profile.longestStreak} days
                            </span>
                            {profile.userId !== user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartConversation(profile.userId)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1 h-[600px]">
                  <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversation?.id || null}
                    onSelectConversation={handleSelectConversation}
                    friendNames={friends.reduce((acc, f) => ({ ...acc, [f.userId]: f.displayName }), {})}
                    friendPhotos={friends.reduce((acc, f) => ({ ...acc, [f.userId]: f.photoURL }), {})}
                    premiumTier="free"
                  />
                </Card>

                <Card className="lg:col-span-2 h-[600px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Select a conversation to start messaging</p>
                    <p className="text-sm mb-4">Or start a new conversation with a friend from the leaderboard</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <MessagingModal
          open={isMessagingModalOpen}
          onOpenChange={setIsMessagingModalOpen}
          conversation={selectedConversation}
          friendName={selectedConversation ? getFriendName(selectedConversation.participants.find((id) => id !== user?.uid) || "") : ""}
          friendPhoto={selectedConversation ? (getFriendPhoto(selectedConversation.participants.find((id) => id !== user?.uid) || "") || undefined) : undefined}
          onSendMessage={handleSendMessage}
          messages={messages}
          typingUsers={selectedConversation?.typingUsers || []}
          premiumTier="free"
        />
      </main>
    </div>
  );
}
