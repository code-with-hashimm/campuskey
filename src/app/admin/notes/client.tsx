"use client";

import { useState } from "react";
import { deleteNote, createNote } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, FileText, Trash2, Loader2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Note = {
  id: string;
  title: string;
  subject: string;
  semester: string;
  file_url?: string;
  created_at: string;
  author_id: string;
  users?: {
    name: string;
  };
};

export default function NotesClient({ initialNotes, subjects }: { initialNotes: Note[], subjects: string[] }) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", subject: "", semester: "1" });
  const [createFile, setCreateFile] = useState<File | null>(null);
  
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const notes = initialNotes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  ).filter((n) => subjectFilter === "all" || n.subject === subjectFilter);


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setIsProcessing(id);
    const res = await deleteNote(id);
    if (res.error) toast.error(res.error);
    else toast.success("Note deleted successfully.");
    setIsProcessing(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing("create");
    
    const formData = new FormData();
    formData.append("title", createForm.title);
    formData.append("subject", createForm.subject);
    formData.append("semester", createForm.semester);
    if (createFile) formData.append("file", createFile);

    const res = await createNote(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Note created successfully.");
      setShowCreate(false);
      setCreateForm({ title: "", subject: "", semester: "1" });
      setCreateFile(null);
    }
    setIsProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notes Management</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Upload New Note
        </Button>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1 justify-end max-w-xl">
             <Select value={subjectFilter} onValueChange={setSubjectFilter}>
               <SelectTrigger className="w-full sm:w-[160px] bg-white">
                 <SelectValue placeholder="All Subjects" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Subjects</SelectItem>
                 {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
               </SelectContent>
             </Select>
             <div className="relative w-full sm:flex-1">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
               <Input
                 type="search"
                 placeholder="Search by title..."
                 className="pl-9 w-full bg-white"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
          </div>
        </div>

        <div className="mt-0 outline-none">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-white">
              <FileText className="h-10 w-10 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No notes found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Card key={note.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                    <p className="text-sm font-medium text-indigo-600 truncate">{note.subject}</p>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1">
                    <p className="text-sm font-semibold text-slate-700 mb-3 bg-slate-100 py-1 px-3 rounded-full inline-block">Semester {note.semester}</p>
                    <p className="text-xs text-slate-500 mb-1">
                      Author: <span className="font-medium text-slate-700">{note.users?.name || "Unknown"}</span>
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 border-t flex flex-wrap gap-2 mt-auto p-4 bg-slate-50/50 rounded-b-xl">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewNote(note)}>
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>

                     <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(note.id)}
                      disabled={isProcessing === note.id}
                    >
                      {isProcessing === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
            <DialogDescription>Upload a new note or resource directly to the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input required placeholder="Note title" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input required placeholder="e.g. Computer Networks" value={createForm.subject} onChange={e => setCreateForm({...createForm, subject: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={createForm.semester} onValueChange={val => setCreateForm({...createForm, semester: val})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(s => (
                    <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment (PDF)</label>
              <Input type="file" accept="application/pdf" onChange={e => setCreateFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-slate-500">Optional. Only PDFs up to 10MB are allowed.</p>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isProcessing === "create"}>
                {isProcessing === "create" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save & Publish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewNote} onOpenChange={(open) => !open && setPreviewNote(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
               <Badge className="bg-indigo-100 text-indigo-700">{previewNote?.subject}</Badge>
            </div>
            <DialogTitle className="text-2xl">{previewNote?.title}</DialogTitle>
            <p className="text-sm text-slate-500">By {previewNote?.users?.name} on {previewNote ? new Date(previewNote.created_at).toLocaleDateString() : ''}</p>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-2">
             <Badge variant="outline" className="text-lg py-1 px-4">Semester {previewNote?.semester}</Badge>
          </div>
          {previewNote?.file_url && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText className="w-5 h-5 text-red-500" /> Attached Document
               </div>
               <Button size="sm" asChild>
                  <a href={previewNote.file_url} target="_blank" rel="noreferrer">Open PDF</a>
               </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
