// src/components/ui/Spinner.tsx
import React from 'react';

export const Spinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-950">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);
