import axios from 'axios';

// Update this URL based on your development environment
// For iOS simulator: http://localhost:3000
// For Android emulator: http://10.0.2.2:3000
// For physical device: http://YOUR_COMPUTER_IP:3000
const API_BASE_URL = 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Habit {
  _id: string;
  name: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface StreakData {
  habitId: string;
  name: string;
  streak: number;
}

// Habits
export const createHabit = async (name: string, emoji?: string): Promise<Habit> => {
  console.log('Creating habit:', name, emoji);
  const response = await api.post('/habits', { name, emoji });
  console.log('Response:', response.data);
  return response.data;
};

export const getHabits = async (): Promise<Habit[]> => {
  const response = await api.get('/habits');
  return response.data;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await api.delete(`/habits/${id}`);
};

// Entries
export const createEntry = async (habitId: string, date: string): Promise<void> => {
  await api.post('/entries', { habitId, date });
};

export const deleteEntry = async (habitId: string, date: string): Promise<void> => {
  await api.delete('/entries', { data: { habitId, date } });
};

export const getTodayEntries = async (): Promise<string[]> => {
  const response = await api.get('/entries/today');
  return response.data;
};

// Stats
export const getHeatmap = async (days = 60): Promise<HeatmapData[]> => {
  const response = await api.get(`/stats/heatmap?days=${days}`);
  return response.data;
};

export const getStreaks = async (): Promise<StreakData[]> => {
  const response = await api.get('/stats/streaks');
  return response.data;
};

