import React from 'react';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterBar = ({ filters, activeFilter, onFilterChange }: FilterBarProps) => (
  <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
    {filters.map((f) => (
      <button
        key={f}
        onClick={() => onFilterChange(f)}
        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap
          ${activeFilter === f 
            ? "bg-primary text-slate-950 border-primary shadow-lg shadow-primary/20 scale-105" 
            : "bg-slate-900/80 text-slate-400 border-slate-800 backdrop-blur-md active:scale-95"}`}
        aria-pressed={activeFilter === f} // Added aria-pressed for accessibility
      >
        {f}
      </button>
    ))}
  </div>
);