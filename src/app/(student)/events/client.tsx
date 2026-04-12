"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CalendarDays, ExternalLink, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Event = {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  button_text: string;
  button_link: string;
  event_date?: string;
  created_at: string;
};

export default function StudentEventsClient({ events }: { events: Event[] }) {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campus Events & Webinars</h1>
        <p className="mt-2 text-lg text-slate-600">
          Discover upcoming workshops, seminars, and networking sessions.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search events by title..."
          className="pl-10 h-11 bg-white border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
         <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-slate-50/50">
            <CalendarDays className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-900">No events found</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              There are no upcoming active events right now. Check back later!
            </p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer flex flex-col"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative aspect-[4/3] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {event.poster_url ? (
                  <img 
                    src={event.poster_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-medium flex items-center text-sm">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
              <CardContent className="pt-5 pb-5 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold leading-tight line-clamp-2 text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {event.title}
                </h3>
                <p className="text-slate-500 mt-2 text-sm line-clamp-2 pb-4">
                  {event.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString() : new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white sm:rounded-2xl border-0 shadow-2xl">
          {selectedEvent && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Image side */}
              <div className="w-full md:w-2/5 bg-slate-100 relative min-h-[250px] md:min-h-[400px]">
                {selectedEvent.poster_url ? (
                  <img 
                    src={selectedEvent.poster_url} 
                    alt={selectedEvent.title} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-slate-300" />
                  </div>
                )}
              </div>
              
              {/* Content side */}
              <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col overflow-y-auto">
                <DialogHeader className="text-left space-y-3 mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase self-start">
                    Active Event
                  </span>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {selectedEvent.title}
                  </DialogTitle>
                  {selectedEvent.event_date && (
                    <p className="text-sm text-slate-500 font-medium pt-1">
                       Event Date: {new Date(selectedEvent.event_date).toLocaleDateString()}
                    </p>
                  )}
                </DialogHeader>
                
                <div className="flex-1">
                   <h4 className="text-sm font-semibold text-slate-900 mb-2">About this event</h4>
                   <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                     {selectedEvent.description}
                   </p>
                </div>
                
                <DialogFooter className="mt-8 pt-6 border-t border-slate-100 sm:justify-start">
                  {selectedEvent.button_link ? (
                    <Button asChild size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                      <a href={selectedEvent.button_link} target="_blank" rel="noreferrer">
                        {selectedEvent.button_text} <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  ) : (
                     <Button size="lg" className="w-full sm:w-auto" disabled>
                        Registration Closed
                     </Button>
                  )}
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
