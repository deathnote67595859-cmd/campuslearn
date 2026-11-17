import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D2A26]/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg select-none';

  const variants = {
    primary: 'bg-[#2D2A26] text-[#FAF7F2] border border-[#2D2A26] hover:bg-[#3D3A35] shadow-soft-xs hover:shadow-soft active:scale-[0.99]',
    yellow: 'bg-[#EAE0D2] text-[#2D2A26] border border-[#D5C9BA] hover:bg-[#E2D6C5] shadow-soft-xs hover:shadow-soft active:scale-[0.99]',
    secondary: 'bg-[#F4EFEA] text-[#2D2A26] border border-[#E5DDD2] hover:bg-[#EFE8DE] shadow-soft-xs hover:shadow-soft active:scale-[0.99]',
    outline: 'bg-white text-[#2D2A26] border border-[#D5C9BA] hover:bg-[#FAF7F2] hover:border-[#2D2A26] shadow-soft-xs hover:shadow-soft active:scale-[0.99]',
    ghost: 'border-transparent text-[#2D2A26] hover:bg-[#F4EFEA] active:scale-[0.99]',
    danger: 'bg-[#B85450] text-white border border-[#A24440] hover:bg-[#A84844] shadow-soft-xs hover:shadow-soft active:scale-[0.99]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
