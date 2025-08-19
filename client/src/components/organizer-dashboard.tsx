import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Timeline } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, Plus, Calendar, Users, TrendingUp, BarChart3, 
  Settings, MapPin, Clock, Target, Download 
} from "lucide-react";
import TimelineMap from "./timeline-map";
import LiveAnnouncements from "./live-announcements";

interface OrganizerDashboardProps {
  activeEvent: Event | undefined;
  setActiveEvent: (eventId: string | null) => void;
}

export default function OrganizerDashboard({ activeEvent, setActiveEvent }: OrganizerDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: "",
    theme: "",
    description: "",
    mode: "online" as "online" | "offline" | "hybrid",
    startDate: "",
    endDate: "",
    tracks: [] as string[],
    sponsors: [] as string[],
    prizes: [] as string[],
  });

  const [timelineData, setTimelineData] = useState({
    label: "",
    description: "",
    dueDate: "",
    order: 1,
  });

  const [trackInput, setTrackInput] = useState("");
  const [sponsorInput, setSponsorInput] = useState("");
  const [prizeInput, setPrizeInput] = useState("");

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });


  const createEventMutation = useMutation({
    mutationFn: async (data: typeof eventData) => {
      const res = await apiRequest("POST", "/api/events", data);
      return res.json();
    },
    onSuccess: (newEvent: Event) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setActiveEvent(newEvent.id);
      setEventData({
        title: "", theme: "", description: "", mode: "online",
        startDate: "", endDate: "", tracks: [], sponsors: [], prizes: []
      });
      setShowEventForm(false);
      toast({
        title: "Event created",
        description: "Your hackathon event is now live!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTimelineMutation = useMutation({
    mutationFn: async (data: typeof timelineData) => {
      if (!activeEvent) throw new Error("No active event");
      const res = await apiRequest("POST", `/api/events/${activeEvent.id}/timeline`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", activeEvent?.id, "timeline"] });
      setTimelineData({ label: "", description: "", dueDate: "", order: 1 });
      setShowTimelineForm(false);
      toast({
        title: "Milestone added",
        description: "Timeline updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.title.trim() || !eventData.startDate || !eventData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createEventMutation.mutate(eventData);
  };

  const handleCreateTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineData.label.trim() || !timelineData.dueDate) {
      toast({
        title: "Validation Error", 
        description: "Label and due date are required",
        variant: "destructive",
      });
      return;
    }
    createTimelineMutation.mutate(timelineData);
  };

  const addTrack = () => {
    if (trackInput.trim() && !eventData.tracks.includes(trackInput.trim())) {
      setEventData({ ...eventData, tracks: [...eventData.tracks, trackInput.trim()] });
      setTrackInput("");
    }
  };

  const addSponsor = () => {
    if (sponsorInput.trim() && !eventData.sponsors.includes(sponsorInput.trim())) {
      setEventData({ ...eventData, sponsors: [...eventData.sponsors, sponsorInput.trim()] });
      setSponsorInput("");
    }
  };

  const addPrize = () => {
    if (prizeInput.trim() && !eventData.prizes.includes(prizeInput.trim())) {
      setEventData({ ...eventData, prizes: [...eventData.prizes, prizeInput.trim()] });
      setPrizeInput("");
    }
  };

  const removeItem = (array: string[], item: string, field: keyof typeof eventData) => {
    setEventData({
      ...eventData,
      [field]: (eventData[field] as string[]).filter(i => i !== item)
    });
  };

  // Real analytics data
  const { data: realAnalytics } = useQuery({
    queryKey: ["/api/events", activeEvent?.id, "analytics"],
    enabled: !!activeEvent?.id,
  });

  const analytics = realAnalytics || {
    participants: 0,
    teams: 0,
    submissions: 0,
    completion: 0
  };

  return (
    <div className="space-y-8">
      {/* Header with Event Creation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Crown className="text-fuchsia-400" />
            Event Organizer Dashboard
          </h2>
          <p className="text-slate-400 mt-1">Manage your hackathon events and track participant engagement</p>
        </div>
        <Button
          onClick={() => setShowEventForm(!showEventForm)}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold hover-glow"
          data-testid="button-create-event"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </motion.div>

      {/* Event Creation Form */}
      {showEventForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="glassmorphism bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Plus className="w-5 h-5 text-fuchsia-400" />
                Create New Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Event Title"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    data-testid="input-event-title"
                    required
                  />
                  <Input
                    placeholder="Event Theme"
                    value={eventData.theme}
                    onChange={(e) => setEventData({ ...eventData, theme: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    data-testid="input-event-theme"
                  />
                </div>

                <Textarea
                  placeholder="Event Description"
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-slate-100"
                  data-testid="textarea-event-description"
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <Select value={eventData.mode} onValueChange={(value: "online" | "offline" | "hybrid") => 
                    setEventData({ ...eventData, mode: value })
                  }>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100" data-testid="select-event-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="datetime-local"
                    value={eventData.startDate}
                    onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    data-testid="input-start-date"
                    required
                  />
                  <Input
                    type="datetime-local"
                    value={eventData.endDate}
                    onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    data-testid="input-end-date"
                    required
                  />
                </div>

                {/* Dynamic Arrays */}
                <div className="space-y-4">
                  {/* Tracks */}
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Tracks</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add track (e.g., AI/ML, Web Dev)"
                        value={trackInput}
                        onChange={(e) => setTrackInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrack())}
                        className="bg-slate-900 border-slate-700 text-slate-100"
                        data-testid="input-track"
                      />
                      <Button type="button" onClick={addTrack} variant="outline" className="border-slate-600">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {eventData.tracks.map((track) => (
                        <Badge key={track} className="bg-fuchsia-700/30 text-fuchsia-300">
                          {track}
                          <button
                            type="button"
                            onClick={() => removeItem(eventData.tracks, track, 'tracks')}
                            className="ml-2 text-fuchsia-400 hover:text-fuchsia-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sponsors */}
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Sponsors</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add sponsor"
                        value={sponsorInput}
                        onChange={(e) => setSponsorInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSponsor())}
                        className="bg-slate-900 border-slate-700 text-slate-100"
                        data-testid="input-sponsor"
                      />
                      <Button type="button" onClick={addSponsor} variant="outline" className="border-slate-600">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {eventData.sponsors.map((sponsor) => (
                        <Badge key={sponsor} className="bg-indigo-700/30 text-indigo-300">
                          {sponsor}
                          <button
                            type="button"
                            onClick={() => removeItem(eventData.sponsors, sponsor, 'sponsors')}
                            className="ml-2 text-indigo-400 hover:text-indigo-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Prizes */}
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Prizes</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add prize (e.g., Best Innovation - $5000)"
                        value={prizeInput}
                        onChange={(e) => setPrizeInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrize())}
                        className="bg-slate-900 border-slate-700 text-slate-100"
                        data-testid="input-prize"
                      />
                      <Button type="button" onClick={addPrize} variant="outline" className="border-slate-600">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {eventData.prizes.map((prize) => (
                        <Badge key={prize} className="bg-emerald-700/30 text-emerald-300">
                          {prize}
                          <button
                            type="button"
                            onClick={() => removeItem(eventData.prizes, prize, 'prizes')}
                            className="ml-2 text-emerald-400 hover:text-emerald-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventForm(false)}
                    className="border-slate-600 text-slate-300"
                    data-testid="button-cancel-event"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold"
                    data-testid="button-save-event"
                  >
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeEvent ? (
            <>
              {/* Event Overview */}
              <Card className="glassmorphism bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Settings className="w-5 h-5 text-fuchsia-400" />
                      {activeEvent.title}
                    </CardTitle>
                    {events.length > 1 && (
                      <Select value={activeEvent.id} onValueChange={setActiveEvent}>
                        <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><span className="text-slate-400">Mode:</span> <Badge className="ml-2">{activeEvent.mode}</Badge></p>
                      <p><span className="text-slate-400">Start:</span> <span className="text-slate-200 ml-2">
                        {new Date(activeEvent.startDate).toLocaleString()}</span></p>
                      <p><span className="text-slate-400">End:</span> <span className="text-slate-200 ml-2">
                        {new Date(activeEvent.endDate).toLocaleString()}</span></p>
                    </div>
                    <div className="space-y-2">
                      {(activeEvent.tracks || []).length > 0 && (
                        <div>
                          <span className="text-slate-400">Tracks:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(activeEvent.tracks || []).map((track) => (
                              <Badge key={track} variant="secondary" className="text-xs">{track}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-200">Timeline Management</h3>
                  <Button
                    onClick={() => setShowTimelineForm(!showTimelineForm)}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    data-testid="button-add-milestone"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                {showTimelineForm && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <form onSubmit={handleCreateTimeline} className="space-y-3">
                        <div className="grid md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Milestone Label"
                            value={timelineData.label}
                            onChange={(e) => setTimelineData({ ...timelineData, label: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                            data-testid="input-milestone-label"
                            required
                          />
                          <Input
                            type="datetime-local"
                            value={timelineData.dueDate}
                            onChange={(e) => setTimelineData({ ...timelineData, dueDate: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                            data-testid="input-milestone-date"
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Order"
                            value={timelineData.order}
                            onChange={(e) => setTimelineData({ ...timelineData, order: Number(e.target.value) })}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                            data-testid="input-milestone-order"
                          />
                        </div>
                        <Input
                          placeholder="Description (optional)"
                          value={timelineData.description}
                          onChange={(e) => setTimelineData({ ...timelineData, description: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-slate-100"
                          data-testid="input-milestone-description"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowTimelineForm(false)}
                            className="border-slate-600 text-slate-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createTimelineMutation.isPending}
                            className="bg-fuchsia-600 hover:bg-fuchsia-500"
                            data-testid="button-save-milestone"
                          >
                            {createTimelineMutation.isPending ? "Adding..." : "Add Milestone"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <TimelineMap eventId={activeEvent.id} />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg mb-4">No events created yet</p>
              <Button
                onClick={() => setShowEventForm(true)}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold hover-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {activeEvent && (
            <>
              {/* Analytics */}
              <Card className="glassmorphism bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    Event Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/80 rounded-xl text-center">
                      <div className="text-2xl font-bold text-fuchsia-400">{analytics.participants}</div>
                      <div className="text-slate-400 text-sm">Participants</div>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-xl text-center">
                      <div className="text-2xl font-bold text-emerald-400">{analytics.teams}</div>
                      <div className="text-slate-400 text-sm">Teams</div>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-xl text-center">
                      <div className="text-2xl font-bold text-indigo-400">{analytics.submissions}</div>
                      <div className="text-slate-400 text-sm">Submissions</div>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-xl text-center">
                      <div className="text-2xl font-bold text-yellow-400">{analytics.completion}%</div>
                      <div className="text-slate-400 text-sm">Completion</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300"
                    data-testid="button-export-report"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>

              <LiveAnnouncements eventId={activeEvent.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
