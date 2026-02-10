'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';

// Main lifts to track
const MAIN_LIFTS = [
  { pattern: 'main', name: 'squat', day: 1, color: '#0a0a0a' },
  { pattern: 'main', name: 'bench', day: 2, color: '#4a7c59' },
  { pattern: 'main', name: 'deadlift', day: 3, color: '#d4a574' },
  { pattern: 'main', name: 'press', day: 4, color: '#737373' },
];

interface ChartDataPoint {
  week: number;
  squat?: number;
  bench?: number;
  deadlift?: number;
  press?: number;
}

export function ProgressChart() {
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  const userSettings = useAppStore((state) => state.userSettings);

  // Build chart data
  const chartData: ChartDataPoint[] = [];

  for (let week = 1; week <= 12; week++) {
    const dataPoint: ChartDataPoint = { week };

    for (const lift of MAIN_LIFTS) {
      // Find the workout log for this week and day
      const workoutId = `week${week}-day${lift.day}`;
      const log = workoutLogs.find((l) => l.workoutId === workoutId);
      
      if (log) {
        // Find the main lift exercise
        const exerciseLog = log.exercises.find((e) => 
          e.exerciseId.includes(`d${lift.day}-${lift.pattern}`)
        );
        
        if (exerciseLog && exerciseLog.sets.length > 0) {
          // Get max weight
          const maxWeight = Math.max(...exerciseLog.sets.map((s) => s.weight));
          if (maxWeight > 0) {
            dataPoint[lift.name as keyof ChartDataPoint] = maxWeight;
          }
        }
      }
    }

    chartData.push(dataPoint);
  }

  // Check if there's any data
  const hasData = chartData.some((d) => 
    d.squat !== undefined || d.bench !== undefined || 
    d.deadlift !== undefined || d.press !== undefined
  );

  if (!hasData) {
    return (
      <div className="border-2 border-border p-6 text-center">
        <p className="font-mono text-muted">
          complete workouts to see your progress chart
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border p-4">
      <h2 className="font-mono font-bold mb-4">main lifts progress</h2>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fontFamily: 'monospace' }}
              tickFormatter={(week) => `w${week}`}
            />
            <YAxis 
              tick={{ fontSize: 12, fontFamily: 'monospace' }}
              tickFormatter={(val) => `${val}`}
              label={{ 
                value: userSettings.units, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fontFamily: 'monospace' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                fontFamily: 'monospace',
                fontSize: 12,
                border: '2px solid #0a0a0a',
                borderRadius: 0,
              }}
              formatter={(value) => [`${value} ${userSettings.units}`, '']}
              labelFormatter={(week) => `week ${week}`}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'monospace', fontSize: 12 }}
            />
            {MAIN_LIFTS.map((lift) => (
              <Line
                key={lift.name}
                type="monotone"
                dataKey={lift.name}
                stroke={lift.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
