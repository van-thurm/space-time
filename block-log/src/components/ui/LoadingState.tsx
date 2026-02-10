'use client';

export function LoadingState({ message = 'loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-lg font-bold mb-2">block log</div>
        <div className="font-mono text-sm text-muted">{message}</div>
      </div>
    </div>
  );
}
