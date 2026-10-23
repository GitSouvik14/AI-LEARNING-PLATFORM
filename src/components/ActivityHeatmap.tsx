import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { DailyActivityRecord, OfflineStorage, UserProgress } from '../utils/offlineSync';
import { Calendar, TrendingUp, Flame, Zap, Clock, Info } from 'lucide-react';

interface ActivityHeatmapProps {
  progress: UserProgress;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ progress }) => {
  const [chartView, setChartView] = useState<'xp' | 'minutes'>('xp');
  const [hoveredDay, setHoveredDay] = useState<DailyActivityRecord | null>(null);

  // Compute 30-day activity records
  const data = OfflineStorage.getActivityHistory(progress);

  // Stats
  const activeDaysCount = data.filter((d) => d.xpGained > 0 || d.minutesStudied > 0).length;
  const consistencyRate = Math.round((activeDaysCount / 30) * 100);
  const totalMinutes = data.reduce((acc, d) => acc + d.minutesStudied, 0);
  const avgMinutes = Math.round(totalMinutes / Math.max(1, activeDaysCount));

  // Custom accessible Tooltip for Recharts
  const CustomRechartsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as DailyActivityRecord;
      return (
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl text-xs text-slate-100 min-w-[160px]">
          <div className="font-bold text-white mb-1.5 pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>{item.date}</span>
            <span className="text-cyan-400 font-mono text-[11px]">{item.dayName}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total XP:</span>
              <span className="font-bold text-cyan-300 font-mono">{item.cumulativeXp} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Daily Gain:</span>
              <span className="font-semibold text-emerald-400 font-mono">+{item.xpGained} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Study Time:</span>
              <span className="font-semibold text-amber-300 font-mono">{item.minutesStudied} mins</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Learning Consistency &amp; XP Growth</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Past 30 Days
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing daily learning retention and streak consolidation.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setChartView('xp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              chartView === 'xp'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative XP</span>
          </button>
          <button
            onClick={() => setChartView('minutes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              chartView === 'minutes'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Practice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Consistency Rate</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{consistencyRate}%</div>
          <div className="text-[10px] text-slate-500">{activeDaysCount} of 30 days active</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Current Streak</div>
          <div className="text-xl font-black text-orange-400 mt-1 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{progress.streakDays} Days</span>
          </div>
          <div className="text-[10px] text-slate-500">Consecutive learning</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Avg Session</div>
          <div className="text-xl font-black text-cyan-400 mt-1">{avgMinutes} mins</div>
          <div className="text-[10px] text-slate-500">Per study day</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">30-Day XP</div>
          <div className="text-xl font-black text-purple-400 mt-1 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>{progress.totalXp} XP</span>
          </div>
          <div className="text-[10px] text-slate-500">Knowledge consolidated</div>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'xp' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  interval={4}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomRechartsTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeXp"
                  name="Cumulative XP"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#xpAreaGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  interval={4}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  unit="m"
                />
                <Tooltip content={<CustomRechartsTooltip />} />
                <ReferenceLine
                  y={progress.personalizedPath?.dailyMinutes || 20}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  label={{
                    value: `Goal: ${progress.personalizedPath?.dailyMinutes || 20}m`,
                    fill: '#38bdf8',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
                <Bar
                  dataKey="minutesStudied"
                  name="Minutes Studied"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>30-Day Consistency Heatmap Grid</span>
            <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
              (Hover tile to view daily details)
            </span>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded bg-slate-800/80 border border-slate-700/60" />
            <div className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800" />
            <div className="w-2.5 h-2.5 rounded bg-emerald-700 border border-emerald-500" />
            <div className="w-2.5 h-2.5 rounded bg-gradient-to-tr from-emerald-500 to-cyan-400 border border-cyan-300" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Cells */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 sm:gap-2">
          {data.map((day, idx) => {
            let colorClass = 'bg-slate-800/60 border-slate-700/40 text-slate-500 hover:border-slate-500';
            if (day.level === 1) {
              colorClass = 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400 hover:border-emerald-600';
            } else if (day.level === 2) {
              colorClass = 'bg-emerald-700/90 border-emerald-500 text-emerald-100 hover:border-emerald-400';
            } else if (day.level === 3) {
              colorClass =
                'bg-gradient-to-tr from-emerald-500 to-cyan-400 border-cyan-300 text-slate-950 font-bold shadow-sm hover:border-white';
            }

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative group rounded-lg border p-1.5 sm:p-2 flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 ${colorClass}`}
                tabIndex={0}
                role="button"
                aria-label={`${day.date}: ${day.xpGained} XP, ${day.minutesStudied} minutes`}
              >
                <span className="text-[10px] font-semibold">{day.dayOfMonth}</span>
                <span className="text-[8px] opacity-75">{day.dayName.slice(0, 1)}</span>
              </div>
            );
          })}
        </div>

        {/* Hovered Day Details Card */}
        {hoveredDay && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{hoveredDay.date}</span>
              <span className="text-slate-400">({hoveredDay.dayName})</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-emerald-400 font-semibold">+{hoveredDay.xpGained} XP</span>
              <span className="text-amber-300 font-semibold">{hoveredDay.minutesStudied} mins studied</span>
              <span className="text-cyan-400 font-semibold">{hoveredDay.cumulativeXp} Cumulative XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
