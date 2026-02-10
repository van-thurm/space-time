'use client';

// Dieter Rams inspired icons - geometric, minimal, analog tech feel

interface IconProps {
  size?: number;
  className?: string;
}

// Dot grid - represents data/sets
export function DotsIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <circle cx="6" cy="6" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

// Dial with indicator - represents progress/RPE
export function DialIcon({ size = 24, className = '', progress = 0.7 }: IconProps & { progress?: number }) {
  const angle = -135 + (progress * 270); // -135 to 135 degrees
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <line 
        x1="12" 
        y1="12" 
        x2="12" 
        y2="5" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${angle} 12 12)`}
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Concentric circles - represents completion/target
export function ConcentricIcon({ size = 24, className = '', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Horizontal lines - represents sets/reps
export function LinesIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Record/vinyl - represents workout day
export function RecordIcon({ size = 24, className = '', hasAccent = false }: IconProps & { hasAccent?: boolean }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="var(--background)" strokeWidth="0.5" opacity="0.3" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="var(--background)" strokeWidth="0.5" opacity="0.3" />
      <circle cx="12" cy="12" r="3" fill="var(--background)" />
      {hasAccent && <circle cx="12" cy="12" r="1" fill="var(--accent)" />}
    </svg>
  );
}

// Half circle with lines - represents phase/progress
export function MeterIcon({ size = 24, className = '', value = 0.5 }: IconProps & { value?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      {/* Background arc */}
      <path 
        d="M 4 18 A 8 8 0 0 1 20 18" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
        const angle = -180 + tick * 180;
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 6;
        const y1 = 18 + Math.sin(rad) * 6;
        const x2 = 12 + Math.cos(rad) * 8;
        const y2 = 18 + Math.sin(rad) * 8;
        return (
          <line 
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2} 
            stroke="currentColor" 
            strokeWidth="1.5"
          />
        );
      })}
      {/* Needle */}
      <line 
        x1="12" 
        y1="18" 
        x2={12 + Math.cos((-180 + value * 180) * Math.PI / 180) * 7}
        y2={18 + Math.sin((-180 + value * 180) * Math.PI / 180) * 7}
        stroke="var(--accent)" 
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

// Sun/Moon for theme toggle
export function SunIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Checkbox states with Dieter Rams styling
export function CheckEmpty({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function CheckFilled({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      <polyline 
        points="7 12 10 15 17 8" 
        fill="none" 
        stroke="var(--background)" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckPartial({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
