import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Timeline } from "@shared/schema";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Check, Code, Upload, Presentation, MapPin } from "lucide-react";

interface TimelineMapProps {
  eventId: string;
}

const statusIcons = {
  completed: <Check className="text-emerald-400" />,
  active: <Code className="text-fuchsia-400" />,
  pending: <MapPin className="text-slate-400" />,
};

const statusClasses = {
  completed: "border-emerald-500 bg-emerald-600/20",
  active: "border-fuchsia-500 bg-fuchsia-600/20 animate-glow",
  pending: "border-slate-600 bg-slate-800",
};

export default function TimelineMap({ eventId }: TimelineMapProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: timelines = [], isLoading } = useQuery<Timeline[]>({
    queryKey: ["/api/events", eventId, "timeline"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ timelineId, status }: { timelineId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/timeline/${timelineId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "timeline"] });
    },
  });

  const handleStatusToggle = (timelineId: string, currentStatus: string) => {
    if (user?.role !== "organizer") return;
    
    const nextStatus = currentStatus === "pending" ? "active" : 
                      currentStatus === "active" ? "completed" : "pending";
    
    updateStatusMutation.mutate({ timelineId, status: nextStatus });
  };

  if (isLoading) {
    return (
      <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-6 w-48"></div>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-700 rounded-full mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <MapPin className="text-fuchsia-400" />
        Event Timeline
      </h2>
      
      <div className="flex items-center justify-between overflow-x-auto pb-4">
        {timelines.map((milestone, index) => (
          <div key={milestone.id} className="flex items-center min-w-0">
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={user?.role === "organizer" ? { scale: 1.05 } : {}}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  statusClasses[milestone.status]
                } ${
                  user?.role === "organizer" ? "cursor-pointer hover-glow" : ""
                }`}
                onClick={() => handleStatusToggle(milestone.id, milestone.status)}
                data-testid={`timeline-milestone-${milestone.id}`}
              >
                {statusIcons[milestone.status]}
              </motion.div>
              <div className="mt-3 text-center min-w-[100px]">
                <div className="text-slate-200 font-semibold text-sm">{milestone.label}</div>
                <div className="text-slate-400 text-xs">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
                {milestone.description && (
                  <div className="text-slate-500 text-xs mt-1">{milestone.description}</div>
                )}
              </div>
            </div>
            {index < timelines.length - 1 && (
              <div className="w-16 h-[2px] bg-slate-700 mx-2"></div>
            )}
          </div>
        ))}
      </div>

      {timelines.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No timeline milestones defined for this event yet.
        </div>
      )}
    </section>
  );
}
