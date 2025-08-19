import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NeonHeader from "@/components/neon-header";
import EventOverview from "@/components/event-overview";
import TimelineMap from "@/components/timeline-map";
import HackMatch from "@/components/hack-match";
import SubmissionsFeed from "@/components/submissions-feed";
import LiveAnnouncements from "@/components/live-announcements";
import Leaderboard from "@/components/leaderboard";
import JudgeCopilot from "@/components/judge-copilot";
import OrganizerDashboard from "@/components/organizer-dashboard";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || "participant");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/20 blur-3xl rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-600/10 blur-3xl rounded-full animate-float"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        <NeonHeader 
          role={selectedRole} 
          setRole={setSelectedRole}
          user={user!}
        />

        {activeEvent ? (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Active Event</div>
                <div className="text-xl font-semibold">{activeEvent.title}</div>
              </div>
              {events.length > 1 && (
                <div>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    value={activeEvent.id}
                    onChange={(e) => setActiveEventId(e.target.value)}
                    data-testid="select-active-event"
                  >
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 text-slate-400">
            No events available. {user?.role === "organizer" ? "Create your first event!" : "Check back later."}
          </div>
        )}

        <div className="space-y-6">
          {selectedRole === "organizer" ? (
            <OrganizerDashboard 
              activeEvent={activeEvent}
              setActiveEvent={setActiveEventId}
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Event & Timeline */}
              <div className="lg:col-span-2 space-y-8">
                {activeEvent && (
                  <>
                    <EventOverview event={activeEvent} />
                    <TimelineMap eventId={activeEvent.id} />
                    
                    {selectedRole === "participant" && (
                      <>
                        <HackMatch eventId={activeEvent.id} />
                        <SubmissionsFeed eventId={activeEvent.id} />
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Right Column - Live Feed & Tools */}
              <div className="space-y-8">
                {activeEvent && (
                  <>
                    <LiveAnnouncements eventId={activeEvent.id} />
                    <Leaderboard eventId={activeEvent.id} />
                    
                    {selectedRole === "judge" && (
                      <JudgeCopilot eventId={activeEvent.id} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
