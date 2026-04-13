import React from 'react';
import { Mail, Check } from 'lucide-react';

export const MailCheckIcon = ({ className }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center w-5 h-5 overflow-hidden ${className}`}>
      {/* Mail Icon that scales down and fades out on hover */}
      <Mail className="absolute w-5 h-5 transition-all duration-300 transform group-hover:scale-75 group-hover:opacity-0 group-hover:-translate-y-2" />
      {/* Check Icon that scales up and fades in on hover */}
      <Check className="absolute w-5 h-5 transition-all duration-300 transform scale-50 opacity-0 translate-y-2 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0" />
    </div>
  );
};
