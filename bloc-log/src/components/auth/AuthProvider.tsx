'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { loadAndHydrate, initSync } from '@/lib/supabase/sync';
import type { SupabaseClient } from '@supabase/supabase-js';

const AuthContext = createContext<SupabaseClient | null>(null);
const SyncReadyContext = createContext(false);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [syncReady, setSyncReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      await loadAndHydrate(supabase, user.id);
      if (cancelled) return;
      cleanup = initSync(supabase, user.id);
      setSyncReady(true);
    }

    bootstrap();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={supabase}>
      <SyncReadyContext.Provider value={syncReady}>
        {children}
      </SyncReadyContext.Provider>
    </AuthContext.Provider>
  );
}

export function useSupabase(): SupabaseClient {
  const client = useContext(AuthContext);
  if (!client) throw new Error('useSupabase must be used within AuthProvider');
  return client;
}

export function useSyncReady(): boolean {
  return useContext(SyncReadyContext);
}
