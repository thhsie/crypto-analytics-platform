import { subHours } from 'date-fns';

export interface PricePoint { timestamp: number; price: number; volume: number; }

export const fetchMockAnalytics = async (coinId: string, days: number): Promise<PricePoint[]> => {
  await new Promise(r => setTimeout(r, 800)); // Cinematic delay
  const data: PricePoint[] = [];
  const now = new Date();
  const base = coinId === 'bitcoin' ? 45000 : 2500;
  
  for (let i = 0; i < days * 24; i++) {
    const time = subHours(now, i).getTime();
    const wave = Math.sin(i * 0.1) * (base * 0.05);
    data.push({
      timestamp: time,
      price: base + wave + Math.random() * (base * 0.01),
      volume: 1000000 + Math.random() * 500000
    });
  }
  return data.reverse();
};