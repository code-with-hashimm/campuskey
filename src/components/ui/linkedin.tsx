import React from 'react';

export const LinkedIn = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-5 h-5 ${className}`}
    >
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
        className="transition-all duration-300 transform origin-bottom group-hover:scale-y-110"
      />
      <rect
        x="2"
        y="9"
        width="4"
        height="12"
        className="transition-transform duration-300 origin-bottom group-hover:-translate-y-1"
      />
      <circle
        cx="4"
        cy="4"
        r="2"
        className="transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-110"
      />
    </svg>
  );
};
