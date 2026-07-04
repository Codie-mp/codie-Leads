import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <img src="/favico.png" alt="Codie Leads Logo" className="w-9 h-9 object-contain drop-shadow-sm" />
      </div>
      
      {showText && (
        <div className="text-xl font-black tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-500">
            Codie<span className="text-yellow-500">Leads</span>
          </span>
        </div>
      )}
    </div>
  );
}
