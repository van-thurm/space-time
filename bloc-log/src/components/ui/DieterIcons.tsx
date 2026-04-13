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
  const width = Math.round(height * (1086 / 206));
  return (
    <svg
      width={width}
      height={height}
      style={{ width, height, flexShrink: 0 }}
      viewBox="0 0 1086 206"
      className={className}
      fill="none"
      aria-label="bloc log"
      role="img"
    >
      <path d="M1040.16 172.441C1024.39 172.441 1011.45 166.866 1001.32 155.714C991.324 144.563 986.325 127.067 986.325 103.226C986.325 87.0755 988.824 73.8733 993.823 63.6191C998.822 53.2368 1005.36 45.7384 1013.43 41.1241C1021.64 36.3815 1030.55 34.0103 1040.16 34.0103C1053.36 34.0103 1063.81 38.0478 1071.5 46.123C1079.19 54.0699 1083.1 65.2854 1083.23 79.7694H1060.35C1060.35 70.5407 1058.74 64.3241 1055.54 61.1197C1052.34 57.7871 1047.21 56.1208 1040.16 56.1208C1034.39 56.1208 1029.26 57.2744 1024.78 59.5815C1020.42 61.8887 1016.83 66.5031 1014.01 73.4246C1011.19 80.3462 1009.78 90.2799 1009.78 103.226C1009.78 116.172 1011.19 126.041 1014.01 132.835C1016.83 139.5 1020.42 143.922 1024.78 146.101C1029.14 148.28 1034.26 149.369 1040.16 149.369C1047.34 149.369 1052.85 148.152 1056.69 145.716C1060.54 143.281 1062.53 139.372 1062.65 133.988L1067.46 118.607H1027.66V99.3804H1085.92V115.723C1085.92 135.847 1081.75 150.331 1073.42 159.175C1065.09 168.019 1054 172.441 1040.16 172.441Z" fill="currentColor"/>
      <path d="M947.103 103.226C947.103 90.4081 945.693 80.5384 942.873 73.6169C940.053 66.6954 936.528 62.081 932.298 59.7738C928.197 57.3384 923.582 56.1208 918.455 56.1208C913.328 56.1208 908.65 57.3384 904.42 59.7738C900.318 62.081 896.857 66.6954 894.038 73.6169C891.218 80.5384 889.808 90.4081 889.808 103.226C889.808 120.914 892.563 133.027 898.075 139.564C903.715 146.101 910.508 149.369 918.455 149.369C926.402 149.369 933.131 146.101 938.643 139.564C944.283 133.027 947.103 120.914 947.103 103.226ZM918.455 172.441C908.842 172.441 900.126 170.134 892.307 165.52C884.488 160.777 878.144 153.279 873.273 143.025C868.53 132.642 866.159 119.376 866.159 103.226C866.159 87.0755 868.53 73.8733 873.273 63.6191C878.144 53.2368 884.488 45.7384 892.307 41.1241C900.126 36.3815 908.842 34.0103 918.455 34.0103C928.069 34.0103 936.784 36.3815 944.603 41.1241C952.422 45.7384 958.703 53.2368 963.445 63.6191C968.316 73.8733 970.751 87.0755 970.751 103.226C970.751 119.376 968.316 132.642 963.445 143.025C958.703 153.279 952.422 160.777 944.603 165.52C936.784 170.134 928.069 172.441 918.455 172.441Z" fill="currentColor"/>
      <path d="M764.311 35.9329H787.383V130.143L784.499 150.331V170.519H764.311V35.9329ZM781.615 150.331H850.831V170.519H781.615V150.331ZM827.759 141.679V131.104H850.831V170.519H833.142L827.759 141.679Z" fill="currentColor"/>
      <path d="M662.502 172.441C646.737 172.441 633.791 166.866 623.665 155.714C613.667 144.563 608.668 127.067 608.668 103.226C608.668 87.0755 611.168 73.8733 616.166 63.6191C621.165 53.2368 627.702 45.7384 635.777 41.1241C643.981 36.3815 652.889 34.0103 662.502 34.0103C675.576 34.0103 685.959 38.0478 693.649 46.123C701.468 54.0699 705.442 65.2854 705.57 79.7694H682.69C682.69 70.9252 680.768 64.7727 676.922 61.3119C673.205 57.8512 668.398 56.1208 662.502 56.1208C656.991 56.1208 651.992 57.5307 647.506 60.3506C643.019 63.1705 639.302 68.1053 636.354 75.155C633.534 82.0766 632.124 91.4335 632.124 103.226C632.124 115.915 633.663 125.721 636.739 132.642C639.943 139.436 643.724 143.922 648.082 146.101C652.569 148.28 657.375 149.369 662.502 149.369C668.142 149.369 672.436 147.895 675.384 144.947C678.46 141.999 680.511 138.026 681.537 133.027C682.562 128.028 683.075 121.94 683.075 114.762H705.954C705.954 132.706 702.494 146.806 695.572 157.06C688.779 167.314 677.755 172.441 662.502 172.441Z" fill="currentColor"/>
      <path d="M564.868 103.226C564.868 90.4081 563.458 80.5384 560.638 73.6169C557.819 66.6954 554.294 62.081 550.064 59.7738C545.962 57.3384 541.348 56.1208 536.221 56.1208C531.094 56.1208 526.415 57.3384 522.185 59.7738C518.084 62.081 514.623 66.6954 511.803 73.6169C508.983 80.5384 507.573 90.4081 507.573 103.226C507.573 120.914 510.329 133.027 515.841 139.564C521.48 146.101 528.274 149.369 536.221 149.369C544.168 149.369 550.897 146.101 556.409 139.564C562.048 133.027 564.868 120.914 564.868 103.226ZM536.221 172.441C526.608 172.441 517.892 170.134 510.073 165.52C502.254 160.777 495.909 153.279 491.038 143.025C486.296 132.642 483.925 119.376 483.925 103.226C483.925 87.0755 486.296 73.8733 491.038 63.6191C495.909 53.2368 502.254 45.7384 510.073 41.1241C517.892 36.3815 526.608 34.0103 536.221 34.0103C545.834 34.0103 554.55 36.3815 562.369 41.1241C570.188 45.7384 576.468 53.2368 581.211 63.6191C586.082 73.8733 588.517 87.0755 588.517 103.226C588.517 119.376 586.082 132.642 581.211 143.025C576.468 153.279 570.188 160.777 562.369 165.52C554.55 170.134 545.834 172.441 536.221 172.441Z" fill="currentColor"/>
      <path d="M377.492 35.9329H400.564V130.143L397.68 150.331V170.519H377.492V35.9329ZM394.796 150.331H464.011V170.519H394.796V150.331ZM440.94 141.679V131.104H464.011V170.519H446.323L440.94 141.679Z" fill="currentColor"/>
      <path d="M277.56 149.562L306.4 149.754C316.91 149.882 324.088 148.408 327.933 145.332C331.779 142.127 333.701 137 333.701 129.951C333.701 125.849 332.804 122.196 331.01 118.992C329.343 115.659 326.459 113.031 322.358 111.109C318.256 109.058 312.937 108.032 306.4 108.032H277.56V88.8059H306.4C313.449 88.8059 318.32 87.0755 321.012 83.6147C323.704 80.1539 325.049 74.8346 325.049 67.6567C325.049 63.0423 324.088 59.8379 322.166 58.0434C320.371 56.1208 316.718 55.1595 311.206 55.1595H277.56V35.9329H320.627C326.524 35.9329 331.587 37.2788 335.816 39.9705C340.046 42.6622 343.251 46.4434 345.43 51.3142C347.609 56.0567 348.698 61.5042 348.698 67.6567C348.698 75.7318 346.327 82.2048 341.584 87.0755C336.842 91.9462 331.01 94.3816 324.088 94.3816V101.303C330.625 101.303 336.393 102.457 341.392 104.764C346.519 107.071 350.429 110.404 353.12 114.762C355.94 119.12 357.35 124.183 357.35 129.951C357.35 136.872 355.748 143.473 352.543 149.754C349.339 155.906 344.468 160.905 337.931 164.751C331.394 168.596 323.447 170.519 314.09 170.519H277.56V149.562ZM266.024 131.104H289.096V134.95L286.212 152.253V170.519H266.024V131.104ZM266.024 88.8059H286.212V106.11L289.096 123.414V132.066H266.024V88.8059ZM266.024 68.618H289.096V74.7705L286.212 92.0744V108.032H266.024V68.618ZM266.024 35.9329H287.942L286.212 54.5827L289.096 66.1186V69.5793H266.024V35.9329Z" fill="currentColor"/>
      <path d="M0 0L69.6242 0.0112914L69.593 205.412L0.0275854 205.457L0 0Z" fill="currentColor"/>
      <path d="M212.999 0.0341797L212.987 92.4277L92.1811 92.4551L92.2338 0L212.999 0.0341797ZM112.91 28.7686L112.898 67.7949L151.742 67.8008L151.806 28.7637L112.91 28.7686Z" fill="currentColor"/>
      <path d="M212.998 112.686L212.985 204.947L91.9512 204.975L92.003 112.651L212.998 112.686ZM112.909 129.442L112.898 168.468L151.741 168.474L151.806 129.437L112.909 129.442Z" fill="currentColor"/>
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
