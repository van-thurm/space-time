import type { WorkoutLog, ExerciseSubstitution, ProgramTemplateId } from '@/types';

interface ExportData {
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  programName?: string;
  templateId?: ProgramTemplateId;
  totalPlannedWorkouts?: number;
}

// Convert workout logs to CSV format
export function exportToCSV(data: ExportData): string {
  const { workoutLogs, exerciseSubstitutions, programName } = data;
  
  // CSV header
  const headers = [
    'program',
    'date',
    'week',
    'day',
    'exercise_name',
    'set_number',
    'weight_lbs',
    'reps',
    'rpe',
    'workout_completed',
  ];

  const rows: string[][] = [headers];

  // Sort logs by date
  const sortedLogs = [...workoutLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const log of sortedLogs) {
    // Parse week and day from workoutId
    const match = log.workoutId.match(/week(\d+)-day(\d+)/);
    if (!match) continue;
    
    const week = parseInt(match[1]);
    const day = parseInt(match[2]);
    
    const formattedDate = new Date(log.date).toLocaleDateString('en-US');

    for (const exerciseLog of log.exercises) {
      // Check for substitution name
      const substitution = exerciseSubstitutions[exerciseLog.exerciseId];
      // Use substitution name, or try to extract from ID
      const exerciseName = substitution?.replacementName || exerciseLog.exerciseId.split('-').slice(2).join('-') || 'Unknown';

      for (let setIndex = 0; setIndex < exerciseLog.sets.length; setIndex++) {
        const set = exerciseLog.sets[setIndex];
        
        rows.push([
          programName || 'Block Log',
          formattedDate,
          week.toString(),
          day.toString(),
          exerciseName,
          (setIndex + 1).toString(),
          set.weight.toString(),
          set.reps.toString(),
          set.rpe.toString(),
          log.completed ? 'yes' : 'no',
        ]);
      }
    }
  }

  // Convert to CSV string
  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

// Trigger download of CSV file
export function downloadCSV(data: ExportData, filename = 'block-log-export.csv'): void {
  const csv = exportToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Export summary stats
export function getExportSummary(data: ExportData): {
  totalWorkouts: number;
  completedWorkouts: number;
  totalSets: number;
  totalVolume: number;
  dateRange: { start: string; end: string } | null;
} {
  const { workoutLogs } = data;
  
  if (workoutLogs.length === 0) {
    return {
      totalWorkouts: data.totalPlannedWorkouts || 0,
      completedWorkouts: 0,
      totalSets: 0,
      totalVolume: 0,
      dateRange: null,
    };
  }

  // Deduplicate any accidental duplicate logs by workoutId; keep newest entry.
  const dedupedByWorkoutId = Array.from(
    new Map(
      [...workoutLogs]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((log) => [log.workoutId, log])
    ).values()
  );

  // Analytics summary metrics should reflect completed sessions only.
  const completedLogs = dedupedByWorkoutId.filter((log) => log.completed);

  if (completedLogs.length === 0) {
    return {
      totalWorkouts: data.totalPlannedWorkouts || dedupedByWorkoutId.length,
      completedWorkouts: 0,
      totalSets: 0,
      totalVolume: 0,
      dateRange: null,
    };
  }

  let totalSets = 0;
  let totalVolume = 0;

  for (const log of completedLogs) {
    for (const exerciseLog of log.exercises) {
      for (const set of exerciseLog.sets) {
        if (set.reps > 0 && set.status !== 'skipped') {
          totalSets++;
          totalVolume += set.weight * set.reps;
        }
      }
    }
  }

  const dates = completedLogs.map((l) => new Date(l.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return {
    totalWorkouts: data.totalPlannedWorkouts || dedupedByWorkoutId.length,
    completedWorkouts: completedLogs.length,
    totalSets,
    totalVolume,
    dateRange: {
      start: minDate.toLocaleDateString('en-US'),
      end: maxDate.toLocaleDateString('en-US'),
    },
  };
}
