"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Bookmark, BookOpen, Download, User as UserIcon, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string;
  subject: string;
  content: string;
  file_url?: string;
  views: number;
  created_at: string;
  authorName: string;
};

export default function StudentNotesClient({ initialNotes, subjects, initialBookmarks }: { initialNotes: Note[], subjects: string[], initialBookmarks: string[] }) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(initialBookmarks));
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = notes
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
    )
    .filter((n) => subjectFilter === "all" || n.subject === subjectFilter)
    .sort((a, b) => {
      if (sortOrder === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "views") return b.views - a.views;
      return 0;
    });

  const toggleBookmark = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    toast.message("Bookmarks are disabled in this client-only build.");
  };

  const handleOpenNote = async (note: Note) => {
    setSelectedNote(note);
    
    // Optimistically increment local views
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, views: n.views + 1 } : n));
  };

  const downloadFile = () => {
    if (selectedNote?.file_url) {
      window.open(selectedNote.file_url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Study Materials</h1>
          <p className="text-sm text-slate-500 mt-1">Access peer-reviewed notes and resources.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search notes or subjects..."
            className="pl-9 w-full bg-white shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white shadow-sm">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-[160px] bg-white shadow-sm">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-white/50 backdrop-blur">
          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No notes found</h3>
          <p className="text-slate-500 max-w-sm mt-2">Check back later or adjust your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="flex flex-col border-slate-200/60 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 bg-white group cursor-pointer" onClick={() => handleOpenNote(note)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-medium">
                    {note.subject}
                  </Badge>
                  <button 
                    className="p-1 -m-1 text-slate-400 hover:text-indigo-500 transition-colors z-10"
                    onClick={(e) => toggleBookmark(e, note.id)}
                  >
                    <Bookmark className="w-5 h-5" fill={bookmarks.has(note.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-indigo-700 transition-colors">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{note.content}</p>
              </CardContent>
              <CardFooter className="pt-0 flex items-center justify-between text-xs text-slate-500">
                 <div className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" /> {note.authorName}
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {note.views}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <div className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
               <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{selectedNote?.subject}</Badge>
               <span>•</span>
               <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedNote?.views} views</div>
            </div>
            <DialogTitle className="text-2xl leading-tight mb-2">{selectedNote?.title}</DialogTitle>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
               <UserIcon className="w-4 h-4" /> Uploaded by {selectedNote?.authorName} on {selectedNote && new Date(selectedNote.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-white">
             <div className="prose prose-sm sm:prose-base max-w-none text-slate-700">
                <p className="whitespace-pre-wrap leading-relaxed">{selectedNote?.content}</p>
             </div>
          </div>
          
          {selectedNote?.file_url && (
            <div className="p-4 sm:p-6 border-t bg-slate-50 flex items-center justify-between mt-auto">
               <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Document Attachment</p>
                    <p className="text-xs text-slate-500">PDF File</p>
                  </div>
               </div>
               <Button onClick={downloadFile} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  <Download className="w-4 h-4 mr-2" /> Download File
               </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
