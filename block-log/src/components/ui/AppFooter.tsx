'use client';

import { VTLogo } from '@/components/ui/DieterIcons';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer className={`border-t border-border mt-12 md:mt-16 ${className}`.trim()}>
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center gap-1.5">
        <VTLogo size={18} className="text-muted" />
        <p className="font-sans text-xs text-muted tracking-wide">built by van thurm</p>
      </div>
    </footer>
  );
}
