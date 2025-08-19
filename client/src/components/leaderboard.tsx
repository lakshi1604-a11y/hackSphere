import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardProps {
  eventId: string;
}

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  averageScore: number;
}

export default function Leaderboard({ eventId }: LeaderboardProps) {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/events", eventId, "leaderboard"],
    enabled: !!eventId,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-500 to-orange-500";
      case 2:
        return "bg-gradient-to-br from-gray-400 to-gray-500";
      case 3:
        return "bg-gradient-to-br from-amber-600 to-amber-700";
      default:
        return "bg-slate-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-fuchsia-400";
    if (score >= 40) return "text-yellow-400";
    return "text-slate-400";
  };

  if (isLoading) {
    return (
      <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                </div>
                <div className="h-5 bg-slate-700 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Trophy className="text-yellow-500" />
          Live Leaderboard
        </h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No scores yet</p>
            <p className="text-slate-500 text-sm mt-1">Leaderboard will update as projects are judged</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.teamId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                index === 0 
                  ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg" 
                  : index === 1
                  ? "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30"
                  : index === 2
                  ? "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/30"
                  : "bg-slate-800/80 border-slate-700 hover:border-fuchsia-700/50"
              }`}
              data-testid={`leaderboard-entry-${entry.teamId}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${getRankBadgeColor(index + 1)}`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getRankIcon(index + 1)}
                  <div className="font-semibold text-slate-200">{entry.teamName}</div>
                  {index === 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">
                      👑 Leading
                    </Badge>
                  )}
                </div>
                <div className="text-slate-400 text-sm">
                  Rank #{index + 1}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-bold text-lg ${getScoreColor(entry.averageScore)}`}>
                  {entry.averageScore.toFixed(1)}
                </div>
                <div className="text-slate-400 text-xs">avg score</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Live update indicator */}
      {leaderboard.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Rankings update in real-time</span>
        </div>
      )}
    </section>
  );
}
