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

// Brutalist brand mark - heavy geometric monolith
export function BrutalistMarkIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Single-shape mark with punched holes (no hardcoded background fill). */}
      <path
        fillRule="evenodd"
        d="M2 2h20v20H2V2z M9 2h2v20H9V2z M11 10h11v3H11v-3z M13 15h6v4h-6v-4z"
        fill="currentColor"
      />
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

// Compact tally icon for counts (avoids menu/hamburger ambiguity)
export function TallyIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="15" y2="12" />
      <line x1="5" y1="17" x2="11" y2="17" />
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
        strokeWidth="2.75"
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

// Abstract bar chart / growth icon for analytics
export function ChartDotsIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      {/* Rising dots pattern - represents growth/progress */}
      <circle cx="5" cy="18" r="2" />
      <circle cx="10" cy="14" r="2" />
      <circle cx="15" cy="10" r="2" />
      <circle cx="20" cy="6" r="2" />
      {/* Baseline */}
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// VT pixel logo - van thurm branding
export function VTLogo({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      className={className}
      fill="currentColor"
    >
      {/* V shape - left stroke */}
      <rect x="1" y="1" width="2" height="2" />
      <rect x="2" y="3" width="2" height="2" />
      <rect x="3" y="5" width="2" height="2" />
      <rect x="4" y="7" width="2" height="2" />
      {/* V shape - right stroke */}
      <rect x="7" y="1" width="2" height="2" />
      <rect x="6" y="3" width="2" height="2" />
      <rect x="5" y="5" width="2" height="2" />
      {/* T shape - horizontal */}
      <rect x="10" y="1" width="2" height="2" />
      <rect x="12" y="1" width="2" height="2" />
      <rect x="14" y="1" width="1" height="2" />
      {/* T shape - vertical */}
      <rect x="12" y="3" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
    </svg>
  );
}

// Timer icon - hourglass/clock style for rest timer
export function TimerIcon({ size = 24, className = '' }: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="12" x2="12" y2="7" strokeLinecap="round" />
      <line x1="12" y1="12" x2="16" y2="12" strokeLinecap="round" />
    </svg>
  );
}

// Gear/Settings icon - classic cog with 6 teeth
export function GearIcon({ size = 24, className = '' }: IconProps) {
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
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2.5" />
      <rect x="11" y="1.5" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="11" y="19.5" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="1.5" y="11" width="3" height="2" fill="currentColor" stroke="none" />
      <rect x="19.5" y="11" width="3" height="2" fill="currentColor" stroke="none" />
      <rect x="4.2" y="4.2" width="2.4" height="2.4" transform="rotate(-45 5.4 5.4)" fill="currentColor" stroke="none" />
      <rect x="17.4" y="17.4" width="2.4" height="2.4" transform="rotate(-45 18.6 18.6)" fill="currentColor" stroke="none" />
      <rect x="17.4" y="4.2" width="2.4" height="2.4" transform="rotate(45 18.6 5.4)" fill="currentColor" stroke="none" />
      <rect x="4.2" y="17.4" width="2.4" height="2.4" transform="rotate(45 5.4 18.6)" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Back arrow - geometric style
export function BackArrowIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 5 5 12 12 19" strokeLinejoin="round" />
    </svg>
  );
}

// Right arrow - geometric pair to BackArrowIcon
export function ForwardArrowIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" strokeLinejoin="round" />
    </svg>
  );
}

// Geometric checkmark - angular style
export function GeometricCheck({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5.5 12.5 10 17 18.5 8.5" />
    </svg>
  );
}

// Pixel fist icon - outline only, monochrome
export function PixelFistIcon({ size = 24, className = '' }: IconProps) {
  // 24x24 pixel mask closely matching the provided raised-fist reference.
  const mask = [
    '........................',
    '........................',
    '........########........',
    '......##..#....###......',
    '.....#..#.#....#..##....',
    '....#...#.#....#...##...',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '...##...#.#....#....##..',
    '....#...#.#....#...##...',
    '....##..#.#....#...##...',
    '.....##.#..#..##..##....',
    '......##....##....##....',
    '.......########....##....',
    '.............##....##....',
    '..............######.....',
    '........................',
    '........................',
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {mask.flatMap((row, y) =>
        row.split('').map((cell, x) =>
          cell === '#'
            ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
            : null
        )
      )}
    </svg>
  );
}

// Industrial alert marker for warning/danger zones
export function AlertMarkIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" />
      <line x1="12" y1="7" x2="12" y2="14" />
      <rect x="11" y="17" width="2" height="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Compact trash icon for destructive actions
export function TrashIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lid + handle */}
      <line x1="4" y1="7" x2="20" y2="7" />
      <rect x="10" y="3" width="4" height="2" fill="currentColor" stroke="none" />
      {/* Can body */}
      <rect x="7" y="8.5" width="10" height="11.5" />
      {/* Interior slats */}
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

// Small geometric report/document icon
export function ReportIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

// Edit/Pencil icon - angular geometric style
export function EditIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17.5V20h2.5L17 9.5 14.5 7 4 17.5z" />
      <line x1="13.5" y1="8" x2="16" y2="10.5" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}
