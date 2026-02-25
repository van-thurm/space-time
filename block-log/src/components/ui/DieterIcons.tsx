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
      <path
        fillRule="evenodd"
        d="M2 2h20v20H2V2z M9 2h2v20H9V2z M11 10h11v3H11v-3z M13 15h6v4h-6v-4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BlockLogWordmark({ height = 20, className = '' }: { height?: number; className?: string }) {
  const aspectRatio = 572 / 100;
  const width = height * aspectRatio;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 572 100"
      className={className}
      fill="none"
      aria-label="block log"
      role="img"
    >
      <path d="M0 0L34 0.00549577L33.9848 99.9784L0.0134709 100L0 0Z" fill="currentColor"/>
      <path d="M540.614 29.638C550.054 28.848 555.053 32.3549 560.062 39.9104L560.018 31.0159C563.871 30.9482 567.889 31.0059 571.756 31.0081L571.764 61.889C571.768 65.8291 571.665 70.0658 571.782 73.9847C572.605 101.581 548.36 101.266 527.412 99.0716L527.397 92.9319L527.416 86.7454C534.858 87.3032 548.591 89.5891 554.771 83.9231C558.05 80.9165 557.958 76.3804 557.984 72.2249C557.417 72.9797 556.828 73.7196 556.22 74.4436C553.004 78.2315 548.525 80.2484 543.479 80.722C519.534 82.9677 512.534 52.2584 525.242 36.8382C529.051 32.2124 534.595 30.0533 540.614 29.638ZM556.981 49.0989C555.034 42.8645 549.004 41.443 542.993 42.0032C529.513 46.4118 530.731 69.9787 548.682 68.2249C556.97 65.0443 559.707 57.8227 556.981 49.0989Z" fill="currentColor"/>
      <path d="M155.848 14.4616C160.74 14.3737 165.809 14.4506 170.717 14.4674L170.772 37.6637C171.266 37.0448 171.778 36.4398 172.307 35.8502C176.151 31.6105 180.321 30.0109 185.88 29.5993C210.559 27.772 216.053 60.8176 202.36 75.9254C201.068 77.0219 199.945 77.9533 198.481 78.8278C193.171 82.0076 186.816 82.9459 180.814 81.4372C174.377 79.7891 171.036 76.4593 167.823 71.0084C167.825 73.9628 167.918 77.5893 167.644 80.4733L155.828 80.4547L155.848 14.4616ZM185.311 69.5631C200.216 63.744 197.329 40.0542 180.072 42.0182C171.261 44.6379 168.458 53.0381 170.994 61.2838C171.945 64.3385 174.083 66.8825 176.927 68.3434C179.494 69.69 182.47 70.0539 185.311 69.5631Z" fill="currentColor"/>
      <path d="M104.016 0.0166016L104.01 44.9863L45.0155 45L45.0409 0L104.016 0.0166016ZM55.1376 14.002L55.1327 32.9971L74.1005 33L74.1317 14L55.1376 14.002Z" fill="currentColor"/>
      <path d="M104.015 54.8467L104.008 99.752L44.9032 99.7656L44.9286 54.8301L104.015 54.8467ZM55.1376 63.002L55.1327 81.9971L74.1005 82L74.1317 63L55.1376 63.002Z" fill="currentColor"/>
      <path d="M483.06 28.6078C498.022 26.8629 511.564 37.5867 513.313 52.5619C515.062 67.537 504.352 81.0955 489.39 82.85C474.421 84.605 460.868 73.8807 459.119 58.8989C457.37 43.9174 468.091 30.3536 483.06 28.6078ZM489.335 69.4457C504.177 64.4781 501.465 39.2932 482.957 42.0219C468.021 47.1791 471.64 72.7476 489.335 69.4457Z" fill="currentColor"/>
      <path d="M266.838 28.6199C281.846 26.9082 295.384 37.7358 297.026 52.7644C298.667 67.7927 287.786 81.2921 272.763 82.866C257.837 84.429 244.455 73.6253 242.824 58.6941C241.194 43.7629 251.928 30.3208 266.838 28.6199ZM273.029 69.4305C287.982 64.3943 285.388 39.5964 266.712 42.0164C251.234 47.4098 255.889 73.0224 273.029 69.4305Z" fill="currentColor"/>
      <path d="M359.961 14.4507C364.831 14.3647 369.928 14.4489 374.817 14.4606C375.27 26.5596 374.864 41.4513 374.919 53.7634C380.7 46.1291 386.529 38.5303 392.402 30.9671C397.54 30.9674 402.677 30.9953 407.814 31.0502C403.079 37.7129 396.713 45.5333 391.63 52.1051C396.12 58.2768 400.536 64.7706 404.909 71.0455L411.536 80.4476L394.77 80.4648C389.68 72.8224 384.539 65.2116 379.354 57.6333L374.871 57.6326L374.846 80.4732L359.953 80.4534L359.961 14.4507Z" fill="currentColor"/>
      <path d="M325.755 29.2414C336.641 28.2358 348.142 33.5995 350.948 44.9861C351.34 46.566 351.585 48.2367 351.841 49.8459C347.117 49.9631 342.06 49.8924 337.307 49.9118C337.11 48.8487 336.872 47.4516 336.392 46.5642C332.203 38.8208 320.779 40.891 318.657 49.2871C317.35 54.4596 317.252 59.5062 319.403 64.2495C321.621 69.1393 328.094 71.125 332.66 68.6588C335.99 66.8512 336.846 64.685 337.896 61.267L344.406 61.2798L352.079 61.2853C351.259 81.2178 326.945 87.8504 312.568 77.4153C301.022 69.0339 299.953 49.2673 308.239 38.3187C312.861 32.2115 318.474 30.294 325.755 29.2414Z" fill="currentColor"/>
      <path d="M429.432 14.4654C436.205 14.3229 443.278 14.4207 450.073 14.4178L450.069 80.4765L435.188 80.4593L435.192 25.4972L429.421 25.4829L429.432 14.4654Z" fill="currentColor"/>
      <path d="M213.093 14.4647C219.858 14.3207 226.945 14.4207 233.734 14.4163L233.73 80.478L218.987 80.4597L219.001 25.4983L213.069 25.4799C213.031 21.8082 213.04 18.1361 213.093 14.4647Z" fill="currentColor"/>
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
