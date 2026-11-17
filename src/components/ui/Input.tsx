import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold tracking-wide text-[#2D2A26]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[#7A756D] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#FAF7F2] border border-[#D5C9BA] rounded-lg py-2.5 text-sm text-[#2D2A26] placeholder:text-[#9A9388] focus:bg-white focus:outline-none focus:border-[#2D2A26] focus:ring-1 focus:ring-[#2D2A26]/10 shadow-soft-xs transition-all duration-150',
              icon ? 'pl-9 pr-3' : 'px-3',
              error && 'border-[#B85450] bg-rose-50/20 focus:border-[#B85450]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#B85450] font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
