import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { Share, Calendar, MapPin } from "lucide-react";

interface EventOverviewProps {
  event: Event;
}

export default function EventOverview({ event }: EventOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-100">
            {event.title}
          </h2>
          <Badge className="bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-700/40">
            <MapPin className="w-3 h-3 mr-1" />
            {event.mode}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          className="border-slate-700 text-slate-300 hover:border-fuchsia-500"
          data-testid="button-share-event"
        >
          <Share className="w-4 h-4 mr-2" />
          Share Event
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-fuchsia-400 font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Event Details
          </h3>
          {event.description && (
            <p className="text-slate-200 mb-3">{event.description}</p>
          )}
          {event.theme && (
            <p className="text-slate-300 mb-3">
              <span className="font-semibold">Theme:</span> {event.theme}
            </p>
          )}
          <div className="text-slate-400 text-sm space-y-1">
            <p>Start: {formatDate(event.startDate)}</p>
            <p>End: {formatDate(event.endDate)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-emerald-400 font-semibold mb-3">Categories & Info</h3>
          
          {event.tracks && event.tracks.length > 0 && (
            <div className="mb-4">
              <p className="text-slate-300 text-sm mb-2">Tracks:</p>
              <div className="flex flex-wrap gap-2">
                {event.tracks.map((track, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  >
                    {track}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.sponsors && event.sponsors.length > 0 && (
            <div>
              <p className="text-slate-300 text-sm mb-2">Sponsors:</p>
              <div className="flex flex-wrap gap-2">
                {event.sponsors.map((sponsor, index) => (
                  <Badge
                    key={index}
                    className="bg-indigo-700/30 text-indigo-300 border-indigo-700/40"
                  >
                    {sponsor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.prizes && event.prizes.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-300 text-sm mb-2">Prizes:</p>
              <div className="space-y-1">
                {event.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-200 text-sm">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    {prize}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
