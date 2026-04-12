"use client";

import { useState } from "react";
import { deleteEvent, toggleEventStatus, createEvent, updateEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CalendarDays, Trash2, Power, PowerOff, Loader2, Edit3, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type Event = {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  button_text: string;
  button_link: string;
  event_date?: string;
  is_active: boolean;
  created_at: string;
};

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formState, setFormState] = useState({
    title: "", description: "", button_text: "Register", button_link: "", event_date: "", is_active: true
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const filteredEvents = initialEvents.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  ).filter((e) => {
    if (activeTab === "active") return e.is_active;
    if (activeTab === "inactive") return !e.is_active;
    return true;
  });

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsProcessing(id);
    const res = await toggleEventStatus(id, currentStatus);
    if (res.error) toast.error(res.error);
    else toast.success(`Event ${currentStatus ? 'deactivated' : 'activated'}`);
    setIsProcessing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    setIsProcessing(id);
    const res = await deleteEvent(id);
    if (res.error) toast.error(res.error);
    else toast.success("Event deleted");
    setIsProcessing(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPosterFile(null);
      setPosterPreview(null);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormState({ title: "", description: "", button_text: "Register", button_link: "", event_date: "", is_active: true });
    setPosterFile(null);
    setPosterPreview(null);
    setShowForm(true);
  };

  const openEdit = (e: Event) => {
    setEditingId(e.id);
    setFormState({ 
      title: e.title, 
      description: e.description, 
      button_text: e.button_text || "Register", 
      button_link: e.button_link || "", 
      event_date: e.event_date || "",
      is_active: e.is_active 
    });
    setPosterFile(null);
    setPosterPreview(e.poster_url || null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing("form");
    
    const formData = new FormData();
    formData.append("title", formState.title);
    formData.append("description", formState.description);
    formData.append("button_text", formState.button_text);
    formData.append("button_link", formState.button_link);
    formData.append("event_date", formState.event_date);
    formData.append("is_active", formState.is_active.toString());
    if (posterFile) formData.append("poster", posterFile);

    const res = editingId 
      ? await updateEvent(editingId, formData)
      : await createEvent(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Event ${editingId ? 'updated' : 'created'} successfully`);
      setShowForm(false);
    }
    setIsProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events & Webinars</h1>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700">
           <Plus className="w-4 h-4 mr-2" /> Create New Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto h-auto">
            <TabsTrigger value="all" className="py-2">All</TabsTrigger>
            <TabsTrigger value="active" className="py-2">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="py-2">Inactive</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-white">
              <CalendarDays className="h-10 w-10 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No events found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b">
                    {event.poster_url ? (
                      <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={event.is_active ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"}>
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-1" title={event.title}>{event.title}</CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date set'}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1">
                    <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 border-t flex gap-2 p-4 bg-slate-50/50 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleToggleStatus(event.id, event.is_active)}
                      disabled={isProcessing === event.id}
                    >
                      {isProcessing === event.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : event.is_active ? (
                        <><PowerOff className="w-4 h-4 mr-2" /> Deactivate</>
                      ) : (
                        <><Power className="w-4 h-4 mr-2 text-emerald-600" /> Activate</>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-white border text-slate-500 hover:text-indigo-600" onClick={() => openEdit(event)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 bg-white border"
                      onClick={() => handleDelete(event.id)}
                      disabled={isProcessing === event.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>Fill in the details for the webinar or event.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input required placeholder="Event title" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea required placeholder="Details about the event..." rows={3} value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Text</label>
                <Input placeholder="e.g. Register Now" value={formState.button_text} onChange={e => setFormState({...formState, button_text: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">External Link (RSVP)</label>
                <Input placeholder="https://..." type="url" value={formState.button_link} onChange={e => setFormState({...formState, button_link: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Date</label>
                <Input type="date" value={formState.event_date} onChange={e => setFormState({...formState, event_date: e.target.value})} />
              </div>
              <div className="space-y-2 mt-6 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formState.is_active}
                  onChange={e => setFormState({...formState, is_active: e.target.checked})}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Publish as Active</label>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">Poster Image</label>
              {posterPreview && (
                 <div className="w-full aspect-video bg-slate-100 rounded border mb-2 overflow-hidden flex items-center justify-center">
                    <img src={posterPreview} className="w-full h-full object-cover" alt="Preview" />
                 </div>
              )}
              <Input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              <p className="text-xs text-slate-500">Optional. JPEG, PNG, or WebP up to 10MB.</p>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isProcessing === "form"}>
                {isProcessing === "form" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
