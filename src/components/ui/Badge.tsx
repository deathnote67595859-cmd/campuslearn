import React from 'react';
import { cn } from '@/lib/utils';
import { SubjectCategory } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'subject';
  subject?: SubjectCategory;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  subject,
  className,
}) => {
  const subjectStyles: Record<string, string> = {
    'C++': 'bg-[#F5EDE0] text-[#7A4B1A] border-[#E3D1B8]',
    'C Programming': 'bg-[#F5EDE0] text-[#7A4B1A] border-[#E3D1B8]',
    'Mathematics': 'bg-[#EEF1F6] text-[#334D6E] border-[#D1D9E6]',
    'Physics': 'bg-[#EBF2EC] text-[#2D5A3A] border-[#CCDCCE]',
    'Computer Networks': 'bg-[#EEF4F7] text-[#2C5268] border-[#CCE0E8]',
    'Data Structures': 'bg-[#F4EEF6] text-[#553C6E] border-[#E0D2E5]',
  };

  const defaultStyle = 'bg-[#F4EFEA] text-[#2D2A26] border-[#E5DDD2]';
  const selectedStyle = subject && subjectStyles[subject] ? subjectStyles[subject] : defaultStyle;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border shadow-soft-xs tracking-wide',
        variant === 'subject' ? selectedStyle : defaultStyle,
        className
      )}
    >
      {children}
    </span>
  );
};
