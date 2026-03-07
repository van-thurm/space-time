'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ui/ThemeProvider';
import { BackArrowIcon, BlockLogWordmark } from '@/components/ui/DieterIcons';

interface SecondaryPageHeaderProps {
  subtitle: string;
  subtitleIcon?: ReactNode;
  backFallbackHref: string;
  onBack?: () => void;
  maxWidthClassName?: string;
  headerClassName?: string;
  backButtonClassName?: string;
  appNameClassName?: string;
  subtitleClassName?: string;
}

const ICON_BUTTON_CLASS =
  'w-[42px] h-[42px] shrink-0 inline-flex items-center justify-center border-b-[2.5px] border-foreground text-foreground hover:text-accent hover:border-accent transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const MENU_ITEM_BASE_CLASS =
  "relative h-10 px-3 font-sans text-sm transition-colors flex items-center before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-transparent";

export function SecondaryPageHeader({
  subtitle,
  backFallbackHref,
  onBack,
  maxWidthClassName = 'w-full',
  headerClassName = 'border-b border-border sticky top-0 bg-background z-40',
  backButtonClassName = '',
  appNameClassName = 'inline-flex items-center justify-center gap-2 font-display font-bold text-lg leading-none hover:text-accent transition-colors',
  subtitleClassName = 'font-sans text-sm text-muted',
}: SecondaryPageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mounted, resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const hasHistory = typeof window !== 'undefined' && window.history.length > 1;

    if (hasHistory) {
      router.back();
      return;
    }

    router.push(backFallbackHref);
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener('pointerdown', onPointerDown);
    }

    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const navLinks = [
    { href: '/', label: 'block' },
    { href: '/programs', label: 'programs' },
    { href: '/timer', label: 'timer' },
    { href: '/analytics', label: 'analytics' },
    { href: '/settings', label: 'settings' },
    { href: '/about', label: 'about' },
  ];

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    setMenuOpen(false);
  };

  return (
    <header className={headerClassName}>
      <div className={`${maxWidthClassName} mx-auto px-4 py-4`}>
        <div className="relative grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3" ref={menuRef}>
          <button
            onClick={handleBack}
            className={`${ICON_BUTTON_CLASS} ${backButtonClassName}`.trim()}
            aria-label={`Go back. Falls back to ${backFallbackHref}`}
          >
            <BackArrowIcon size={18} />
          </button>

          <div className="min-w-0 flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center justify-center hover:text-accent transition-colors">
              <BlockLogWordmark height={18} className="text-foreground" />
            </Link>
            <div className="mt-0.5">
              <p suppressHydrationWarning className={`${subtitleClassName} break-words`}>
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={ICON_BUTTON_CLASS}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className="font-sans text-xl leading-none">+</span>
          </button>

          {menuOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-44 border border-border overflow-hidden bg-background z-50">
              <nav className="py-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`${MENU_ITEM_BASE_CLASS} w-full text-muted hover:text-foreground hover:bg-foreground/10 hover:before:bg-accent/70`}
                >
                  <span className="mr-2 text-accent">+</span>
                  {mounted ? (resolvedTheme === 'dark' ? 'light mode' : 'dark mode') : 'theme'}
                </button>
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`${MENU_ITEM_BASE_CLASS} ${
                      pathname === item.href
                        ? 'text-foreground bg-foreground/12 before:bg-accent'
                        : 'text-muted hover:text-foreground hover:bg-foreground/10 hover:before:bg-accent/70'
                    }`}
                  >
                    <span className="mr-2 text-accent">+</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
