"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Bookmark, BookOpen, Download, User as UserIcon, Eye, AlertCircle, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string;
  subject: string;
  content: string;
  attachment_url?: string;
  views: number;
  created_at: string;
  authorName: string;
};

export default function StudentNotesClient({
  initialNotes,
  subjects,
  initialBookmarks,
  error: serverError
}: {
  initialNotes: Note[],
  subjects: string[],
  initialBookmarks: string[],
  error?: string | null
}) {
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
    if (selectedNote?.attachment_url) {
      window.open(selectedNote.attachment_url, '_blank');
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

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold">Error loading notes</p>
            <p className="text-sm opacity-90">{serverError}</p>
          </div>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-white/50 backdrop-blur">
          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No notes found</h3>
          <p className="text-slate-500 max-w-sm mt-2">Check back later or adjust your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="flex flex-col border-slate-200/60 shadow-sm hover:shadow-lg transition-all hover:border-indigo-200 bg-white group cursor-pointer overflow-hidden" onClick={() => handleOpenNote(note)}>
              {note.attachment_url ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <div className="absolute inset-0 z-10 bg-transparent transition-transform duration-500 group-hover:scale-105">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(note.attachment_url)}&embedded=true`}
                      className="w-full h-full pointer-events-none opacity-90 shadow-inner"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-900 shadow-xl border border-white/50 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Quick View
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <BookOpen className="w-10 h-10 text-slate-200" />
                </div>
              )}
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
              <CardFooter className="pt-0 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-500 w-full">
                  <div className="flex items-center gap-1.5 font-medium">
                    <UserIcon className="w-3.5 h-3.5" /> {note.authorName}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {note.views}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {note.attachment_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-[11px] font-semibold tracking-wide uppercase border-indigo-100 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all gap-1.5 rounded-lg shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(note.attachment_url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" /> Preview Document
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogDescription className="sr-only">
            Viewing details for study material: {selectedNote?.title}
          </DialogDescription>
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

          {selectedNote?.attachment_url && (
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
