import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { Crown, Gavel, Users } from "lucide-react";

interface NeonHeaderProps {
  role: string;
  setRole: (role: string) => void;
  user: User;
}

export default function NeonHeader({ role, setRole, user }: NeonHeaderProps) {
  const { logoutMutation } = useAuth();

  const roleIcons = {
    participant: <Users className="w-4 h-4" />,
    organizer: <Crown className="w-4 h-4" />,
    judge: <Gavel className="w-4 h-4" />,
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism bg-slate-900/60 border border-fuchsia-700/30 rounded-3xl mb-8 neon-border"
    >
      <div className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">
              HackSphere
            </h1>
            <p className="text-slate-300 mt-3 text-lg max-w-2xl">
              Metaverse-inspired hackathon hub with AI-powered judging, swipe teaming, and real-time collaboration
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">Live Platform</span>
              </div>
              <div className="text-slate-400 text-sm">
                Welcome back, <span className="text-fuchsia-400">{user.name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Role Selector */}
            <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-2xl">
              {[
                { key: "participant", label: "Participant" },
                { key: "organizer", label: "Organizer" },
                { key: "judge", label: "Judge" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all ${
                    role === r.key
                      ? "bg-fuchsia-600 text-white shadow-lg hover-glow"
                      : "bg-transparent border border-slate-600 text-slate-300 hover:border-fuchsia-500 hover:text-white"
                  }`}
                  disabled={user.role !== r.key && user.role !== "organizer"}
                  data-testid={`button-role-${r.key}`}
                >
                  {roleIcons[r.key as keyof typeof roleIcons]}
                  {r.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:border-fuchsia-500 hover:text-white"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
