// Program templates - blueprints for different training programs

import type { ProgramTemplate, ProgramTemplateId } from '@/types';

export const programTemplates: Record<ProgramTemplateId, ProgramTemplate> = {
  '4-day-upper-lower': {
    id: '4-day-upper-lower',
    name: '4-Day Upper/Lower Split',
    shortName: '4-Day U/L',
    description: 'Classic upper/lower split with progressive overload. Best for intermediate lifters.',
    daysPerWeek: 4,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength & hypertrophy',
    dayLabels: ['Lower A', 'Upper A', 'Lower B', 'Upper B'],
  },
  '4-day-total-body': {
    id: '4-day-total-body',
    name: '4-Day Total Body',
    shortName: '4-Day Full',
    description: 'Full body each session with varied intensity. Great for muscle building.',
    daysPerWeek: 4,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'hypertrophy',
    dayLabels: ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D'],
  },
  '3-day-full-body-strength': {
    id: '3-day-full-body-strength',
    name: '3-Day Full Body Strength',
    shortName: '3-Day Full Body',
    description: 'Intermediate full body strength template with heavy, volume, and power emphasis.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength',
    dayLabels: ['Full Body A', 'Full Body B', 'Full Body C'],
  },
  '3-day-upper-lower-hybrid': {
    id: '3-day-upper-lower-hybrid',
    name: '3-Day Upper/Lower Hybrid',
    shortName: '3-Day Hybrid',
    description: 'Upper, Lower, and Full Body. Efficient for busy schedules.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'balanced strength',
    dayLabels: ['Lower', 'Upper', 'Full Body'],
  },
  '3-day-total-body-texas': {
    id: '3-day-total-body-texas',
    name: '3-Day Total Body (Texas Method)',
    shortName: '3-Day Texas',
    description: 'Volume, recovery, intensity. Proven for strength gains.',
    daysPerWeek: 3,
    weeksTotal: 12,
    equipment: 'full-gym',
    focus: 'strength',
    dayLabels: ['Volume', 'Recovery', 'Intensity'],
  },
  '2-day-total-body': {
    id: '2-day-total-body',
    name: '2-Day Total Body',
    shortName: '2-Day Min',
    description: 'Minimum effective dose. Full body 2x per week.',
    daysPerWeek: 2,
    weeksTotal: 8,
    equipment: 'full-gym',
    focus: 'maintenance & strength',
    dayLabels: ['Full Body A', 'Full Body B'],
  },
  '5-day-total-body-circuit': {
    id: '5-day-total-body-circuit',
    name: '5-Day Total Body Circuit',
    shortName: '5-Day Circuit',
    description: 'High frequency circuit training for conditioning.',
    daysPerWeek: 5,
    weeksTotal: 8,
    equipment: 'full-gym',
    focus: 'conditioning & strength',
    dayLabels: ['Push Focus', 'Pull Focus', 'Legs Focus', 'Full Circuit A', 'Full Circuit B'],
  },
  '3-day-survival-mode': {
    id: '3-day-survival-mode',
    name: '3-Day Survival Mode',
    shortName: 'Survival',
    description: '30-35 min workouts. Maintain strength and mobility during busy times.',
    daysPerWeek: 3,
    weeksTotal: 6,
    equipment: 'full-gym',
    focus: 'maintenance',
    dayLabels: ['Strength A', 'Strength B', 'Mobility'],
  },
  '3-day-simple-total-body': {
    id: '3-day-simple-total-body',
    name: '3-Day Simple Total Body',
    shortName: '3-Day Simple',
    description: 'Dumbbells, bodyweight & bands only. No gym required.',
    daysPerWeek: 3,
    weeksTotal: 8,
    equipment: 'minimal',
    focus: 'functional fitness',
    dayLabels: ['Full Body A', 'Full Body B', 'Full Body C'],
  },
  '4-day-simple-total-body': {
    id: '4-day-simple-total-body',
    name: '4-Day Simple Total Body',
    shortName: '4-Day Simple',
    description: 'Dumbbells, bodyweight & bands only. 4 days per week.',
    daysPerWeek: 4,
    weeksTotal: 8,
    equipment: 'minimal',
    focus: 'functional fitness',
    dayLabels: ['Full A', 'Full B', 'Full C', 'Full D'],
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
