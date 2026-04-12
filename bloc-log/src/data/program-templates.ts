// Program templates - blueprints for different training programs

import type { ProgramTemplate, ProgramTemplateId } from '@/types';

export const programTemplates: Record<ProgramTemplateId, ProgramTemplate> = {
  '4-day-upper-lower': {
    id: '4-day-upper-lower',
    name: '4-day upper/lower split',
    shortName: '4-day u/l',
    description: 'classic upper/lower split with progressive overload. best for intermediate lifters.',
    daysPerWeek: 4,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength & hypertrophy',
    dayLabels: ['lower a', 'upper a', 'lower b', 'upper b'],
  },
  '4-day-total-body': {
    id: '4-day-total-body',
    name: '4-day total body',
    shortName: '4-day full',
    description: 'full body each session with varied intensity. great for muscle building.',
    daysPerWeek: 4,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'hypertrophy',
    dayLabels: ['full body a', 'full body b', 'full body c', 'full body d'],
  },
  '3-day-full-body-strength': {
    id: '3-day-full-body-strength',
    name: '3-day full body strength',
    shortName: '3-day full body',
    description: 'intermediate full body strength template with heavy, volume, and power emphasis.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength',
    dayLabels: ['full body a', 'full body b', 'full body c'],
  },
  '3-day-upper-lower-hybrid': {
    id: '3-day-upper-lower-hybrid',
    name: '3-day upper/lower hybrid',
    shortName: '3-day hybrid',
    description: 'upper, lower, and full body. efficient for busy schedules.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'balanced strength',
    dayLabels: ['lower', 'upper', 'full body'],
  },
  '3-day-total-body-texas': {
    id: '3-day-total-body-texas',
    name: '3-day total body (texas method)',
    shortName: '3-day texas',
    description: 'volume, recovery, intensity. proven for strength gains.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength',
    dayLabels: ['volume', 'recovery', 'intensity'],
  },
  '2-day-total-body': {
    id: '2-day-total-body',
    name: '2-day total body',
    shortName: '2-day min',
    description: 'minimum effective dose. full body 2x per week.',
    daysPerWeek: 2,
    weeksTotal: 8,
    equipment: 'full-gym',
    focus: 'maintenance & strength',
    dayLabels: ['full body a', 'full body b'],
  },
  '5-day-total-body-circuit': {
    id: '5-day-total-body-circuit',
    name: '5-day total body circuit',
    shortName: '5-day circuit',
    description: 'high frequency circuit training for conditioning.',
    daysPerWeek: 5,
    weeksTotal: 8,
    equipment: 'full-gym',
    focus: 'conditioning & strength',
    dayLabels: ['push focus', 'pull focus', 'legs focus', 'full circuit a', 'full circuit b'],
  },
  '3-day-survival-mode': {
    id: '3-day-survival-mode',
    name: '3-day survival mode',
    shortName: 'survival',
    description: '30-35 min workouts. maintain strength and mobility during busy times.',
    daysPerWeek: 3,
    weeksTotal: 6,
    equipment: 'full-gym',
    focus: 'maintenance',
    dayLabels: ['strength a', 'strength b', 'mobility'],
  },
  '3-day-simple-total-body': {
    id: '3-day-simple-total-body',
    name: '3-day simple total body',
    shortName: '3-day simple',
    description: 'dumbbells, bodyweight & bands only. no gym required.',
    daysPerWeek: 3,
    weeksTotal: 8,
    equipment: 'minimal',
    focus: 'functional fitness',
    dayLabels: ['full body a', 'full body b', 'full body c'],
  },
  '4-day-simple-total-body': {
    id: '4-day-simple-total-body',
    name: '4-day simple total body',
    shortName: '4-day simple',
    description: 'dumbbells, bodyweight & bands only. 4 days per week.',
    daysPerWeek: 4,
    weeksTotal: 8,
    equipment: 'minimal',
    focus: 'functional fitness',
    dayLabels: ['full a', 'full b', 'full c', 'full d'],
  },
  'custom': {
    id: 'custom',
    name: 'custom program',
    shortName: 'custom',
    description: 'Build your own. Start with a blank slate.',
    daysPerWeek: 4,  // Sensible default
    weeksTotal: 12,  // Sensible default
    equipment: 'custom',
    focus: 'your choice',
    dayLabels: ['day 1', 'day 2', 'day 3', 'day 4'],
  },
};

// Get template by ID
export function getTemplate(id: ProgramTemplateId): ProgramTemplate {
  return programTemplates[id];
}

// Get all templates as array
export function getAllTemplates(): ProgramTemplate[] {
  return Object.values(programTemplates);
}

// Get templates grouped by equipment type
export function getTemplatesByEquipment(): { fullGym: ProgramTemplate[]; minimal: ProgramTemplate[] } {
  const all = getAllTemplates().filter(t => t.id !== 'custom');
  return {
    fullGym: all.filter(t => t.equipment === 'full-gym'),
    minimal: all.filter(t => t.equipment === 'minimal'),
  };
}
