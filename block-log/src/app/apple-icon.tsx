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
          background: '#1A1816',
          borderRadius: 32,
        }}
      >
        <svg width="120" height="120" viewBox="44 0 60 100">
          <path d="M104.016 0.0166016L104.01 44.9863L45.0155 45L45.0409 0L104.016 0.0166016ZM55.1376 14.002L55.1327 32.9971L74.1005 33L74.1317 14L55.1376 14.002Z" fill="#FAF7F2"/>
          <path d="M104.015 54.8467L104.008 99.752L44.9032 99.7656L44.9286 54.8301L104.015 54.8467ZM55.1376 63.002L55.1327 81.9971L74.1005 82L74.1317 63L55.1376 63.002Z" fill="#FAF7F2"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
