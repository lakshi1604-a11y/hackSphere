import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Announcement, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, Clock } from "lucide-react";

interface LiveAnnouncementsProps {
  eventId: string;
}

type AnnouncementWithCreator = Announcement & { creator: User };

export default function LiveAnnouncements({ eventId }: LiveAnnouncementsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const { data: announcements = [], isLoading } = useQuery<AnnouncementWithCreator[]>({
    queryKey: ["/api/events", eventId, "announcements"],
    enabled: !!eventId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/announcements`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "announcements"] });
      setMessage("");
      toast({
        title: "Announcement posted",
        description: "Your announcement is now live!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post announcement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    createAnnouncementMutation.mutate(message.trim());
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - new Date(dateString).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-xl">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
        <Megaphone className="text-fuchsia-400" />
        Live Announcements
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-auto"></div>
      </h2>

      {/* Post Form (Organizer only) */}
      {user?.role === "organizer" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Post an announcement to all participants..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-100 min-h-[80px] resize-none"
              data-testid="textarea-announcement"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createAnnouncementMutation.isPending || !message.trim()}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold hover-glow"
                data-testid="button-post-announcement"
              >
                {createAnnouncementMutation.isPending ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Announce
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Announcements List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        <AnimatePresence>
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No announcements yet</p>
              <p className="text-slate-500 text-sm mt-1">Stay tuned for updates!</p>
            </div>
          ) : (
            announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-fuchsia-700/30 transition-all"
                data-testid={`announcement-${announcement.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${
                        announcement.creator.role === "organizer" 
                          ? "bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-700/40"
                          : "bg-slate-700/50 text-slate-300 border-slate-600"
                      }`}
                    >
                      {announcement.creator.name}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(announcement.createdAt.toString())}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
        <span>Updates automatically every 5 seconds</span>
      </div>
    </section>
  );
}
