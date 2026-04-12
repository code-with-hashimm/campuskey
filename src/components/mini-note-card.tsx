"use client";

import { Eye, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";

type MiniNoteCardProps = {
  id: string;
  title: string;
  subject: string;
  attachment_url?: string | null;
  relativeTime: string;
};

export default function MiniNoteCard({ title, subject, attachment_url, relativeTime }: MiniNoteCardProps) {
  const handleClick = () => {
    if (attachment_url) {
      window.open(attachment_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="secondary" 
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none font-medium px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
          >
            {subject}
          </Badge>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
        
        <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors" title={title}>
          {title}
        </h4>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">{relativeTime}</span>
        <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:underline">
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </div>
      </div>
    </div>
  );
}
