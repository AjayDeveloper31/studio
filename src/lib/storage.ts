import type { AppUsageStat } from './types';

const STATS_KEY = 'nudgeblock_stats';

export const getUsageStats = (): AppUsageStat[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const statsJson = localStorage.getItem(STATS_KEY);
  try {
    return statsJson ? JSON.parse(statsJson) : [];
  } catch (error) {
    console.error("Failed to parse usage stats from localStorage", error);
    return [];
  }
};

export const addUsageStat = (stat: { appName: string, duration: number }): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const stats = getUsageStats();
  const newStat: AppUsageStat = {
    ...stat,
    id: new Date().toISOString() + Math.random(),
    date: new Date().toISOString(),
  };
  stats.push(newStat);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};
