import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Team } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, X, Users } from "lucide-react";

interface HackMatchProps {
  eventId: string;
}

export default function HackMatch({ eventId }: HackMatchProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedUsers, setSwipedUsers] = useState<string[]>([]);

  // Mock users for now - in real implementation, this would fetch available users
  const mockUsers: User[] = [
    {
      id: "user-2",
      username: "amrutha_ml",
      name: "Amrutha",
      email: "amrutha@example.com",
      bio: "ML generalist who ships fast",
      avatar: "🤖",
      skills: ["Python", "ML", "NLP"],
      role: "participant",
      password: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-3",
      username: "himashi_dev",
      name: "Himashi",
      email: "himashi@example.com",
      bio: "Loves scalable backends",
      avatar: "🛠️",
      skills: ["Node", "SQL", "DevOps"],
      role: "participant",
      password: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-4",
      username: "saumya_design",
      name: "Saumya",
      email: "saumya@example.com",
      bio: "Design + 3D micro-interactions",
      avatar: "🎨",
      skills: ["Figma", "3D", "Three.js"],
      role: "participant",
      password: "",
      createdAt: new Date().toISOString(),
    },
  ];

  const availableUsers = mockUsers.filter(u => 
    u.id !== user?.id && !swipedUsers.includes(u.id)
  );

  const { data: userTeams = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "teams"],
    enabled: !!user?.id,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; eventId: string }) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/teams`, teamData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "teams"] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/members`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "teams"] });
    },
  });

  const currentUser = availableUsers[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    if (!currentUser) return;

    setSwipedUsers(prev => [...prev, currentUser.id]);
    
    if (liked) {
      // In a real implementation, you'd match users based on mutual likes
      // For now, we'll create a team immediately
      if (userTeams.length === 0) {
        // Create new team if user doesn't have one
        await createTeamMutation.mutateAsync({
          name: `Team ${user?.name}`,
          eventId,
        });
      } else {
        // Add to existing team
        const team = userTeams[0]?.team;
        if (team) {
          await addMemberMutation.mutateAsync({
            teamId: team.id,
            userId: currentUser.id,
          });
        }
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const currentTeam = userTeams[0]?.team;

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Heart className="text-fuchsia-400" />
          HackMatch - Find Your Team
        </h2>
        {currentTeam && (
          <Badge className="bg-emerald-700/30 text-emerald-300">
            Team: {currentTeam.name}
          </Badge>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Swipe Cards */}
        <div className="relative h-80">
          <AnimatePresence>
            {currentUser ? (
              <motion.div
                key={currentUser.id}
                initial={{ scale: 0.95, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.95, opacity: 0, x: 300 }}
                className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-fuchsia-700/50 p-6 hover-glow cursor-pointer"
                data-testid={`user-card-${currentUser.id}`}
              >
                <div className="text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="text-6xl mb-4">{currentUser.avatar}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentUser.name}</h3>
                    <p className="text-slate-300 text-sm mb-4">{currentUser.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {currentUser.skills?.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-700/40"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleSwipe(false)}
                      variant="destructive"
                      size="lg"
                      className="rounded-full w-12 h-12 p-0"
                      data-testid="button-reject"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => handleSwipe(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-full w-12 h-12 p-0"
                      data-testid="button-like"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-slate-800/50 rounded-2xl border border-slate-700 p-6 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No more candidates available!</p>
                  <p className="text-sm mt-2">Great picks! 🎯</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Current Team */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            {currentTeam ? `Your Team: ${currentTeam.name}` : "Form Your Team"}
          </h3>
          
          {currentTeam ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-200">{user?.name}</div>
                  <div className="text-slate-400 text-sm">{user?.bio || "Team Leader"}</div>
                </div>
                <Badge className="bg-fuchsia-700/30 text-fuchsia-300">Leader</Badge>
              </div>

              {/* Placeholder for additional members */}
              <div className="flex items-center gap-4 p-3 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-slate-500">Find teammates using HackMatch...</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Start swiping to form your dream team!</p>
              <p className="text-slate-500 text-sm">Match with other participants based on skills and interests.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
