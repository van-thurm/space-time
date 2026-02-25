import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#C4572A',
          borderRadius: 32,
        }}
      >
        {/* 3x3 dots grid - orange and white mix */}
        <svg width="120" height="120" viewBox="0 0 24 24">
          <circle cx="4" cy="4" r="3" fill="#FAF7F2" />
          <circle cx="12" cy="4" r="3" fill="#FAF7F2" />
          <circle cx="20" cy="4" r="3" fill="#FAF7F2" />
          <circle cx="4" cy="12" r="3" fill="#FAF7F2" />
          <circle cx="12" cy="12" r="3" fill="#FAF7F2" />
          <circle cx="20" cy="12" r="3" fill="#FAF7F2" />
          <circle cx="4" cy="20" r="3" fill="#FAF7F2" />
          <circle cx="12" cy="20" r="3" fill="#FAF7F2" />
          <circle cx="20" cy="20" r="3" fill="#FAF7F2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
