// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${icon ? 'pl-12' : 'pl-5'} ${className || ''}`}
            {...props}
          />
          {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
