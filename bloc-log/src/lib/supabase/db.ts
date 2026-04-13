import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProgram, UserSettings, UserCustomTemplate } from '@/types';

export interface UserMeta {
  activeProgramId: string | null;
  lastTrainedProgramId: string | null;
  currentWeek: number;
  settings: UserSettings;
  customTemplates: UserCustomTemplate[];
}

export interface UserData {
  programs: UserProgram[];
  meta: UserMeta;
}

const defaultMeta: UserMeta = {
  activeProgramId: null,
  lastTrainedProgramId: null,
  currentWeek: 1,
  settings: {
    units: 'lbs',
    showRestTimer: true,
    cascadeWeightToSets: true,
    keepScreenAwake: false,
  },
  customTemplates: [],
};

export async function loadUserData(
  client: SupabaseClient,
  userId: string
): Promise<UserData> {
  const [programsResult, metaResult] = await Promise.all([
    client.from('programs').select('id, data, updated_at').eq('user_id', userId),
    client.from('user_meta').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  const programs: UserProgram[] = (programsResult.data ?? []).map((row) => ({
    ...(row.data as UserProgram),
    id: row.id,
  }));

  const meta: UserMeta = metaResult.data
    ? {
        activeProgramId: metaResult.data.active_program_id,
        lastTrainedProgramId: metaResult.data.last_trained_program_id,
        currentWeek: metaResult.data.current_week,
        settings: (metaResult.data.settings as UserSettings) ?? defaultMeta.settings,
        customTemplates:
          (metaResult.data.custom_templates as UserCustomTemplate[]) ?? defaultMeta.customTemplates,
      }
    : { ...defaultMeta };

  return { programs, meta };
}

export async function saveProgram(
  client: SupabaseClient,
  userId: string,
  program: UserProgram
): Promise<void> {
  const { error } = await client.from('programs').upsert(
    {
      id: program.id,
      user_id: userId,
      data: program,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function saveUserMeta(
  client: SupabaseClient,
  userId: string,
  meta: UserMeta
): Promise<void> {
  const { error } = await client.from('user_meta').upsert(
    {
      user_id: userId,
      active_program_id: meta.activeProgramId,
      last_trained_program_id: meta.lastTrainedProgramId,
      current_week: meta.currentWeek,
      settings: meta.settings,
      custom_templates: meta.customTemplates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

export async function deleteProgram(
  client: SupabaseClient,
  programId: string
): Promise<void> {
  const { error } = await client.from('programs').delete().eq('id', programId);
  if (error) throw error;
}

export async function clearAllUserData(
  client: SupabaseClient,
  userId: string
): Promise<void> {
  const [programsResult, metaResult] = await Promise.allSettled([
    client.from('programs').delete().eq('user_id', userId),
    client.from('user_meta').delete().eq('user_id', userId),
  ]);
  if (programsResult.status === 'rejected') throw programsResult.reason;
  if (metaResult.status === 'rejected') throw metaResult.reason;
}

export async function getUserProgramCount(
  client: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await client
    .from('programs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}
