import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthHeaders } from '../api/client';
import { auth } from '../config/firebase';

// Types
export interface TrackedPair {
    _id: string;
    coin_id: string;
    vs_currency: string;
    status: 'active' | 'stopped';
    created_at: string;
}

// 1. Fetch Historical Data
export const useAnalytics = (coin: string, vs: string, days: number) => {
    return useQuery({
        queryKey: ['analytics', coin, vs, days],
        queryFn: async () => {
            const conf = await getAuthHeaders();
            const now = Date.now();
            const from = now - (days * 24 * 60 * 60 * 1000);
            const { data } = await api.get(`/analytics/${coin}/${vs}`, { 
                ...conf, 
                params: { from, to: now } 
            });
            return data as { timestamp: number; price: number; volume: number }[];
        },
        enabled: !!auth.currentUser,
        refetchInterval: 60000 
    });
};

// 2. Fetch Active Tracked Pairs
export const useTrackedPairs = () => {
    return useQuery({
        queryKey: ['pairs'],
        queryFn: async () => {
            const conf = await getAuthHeaders();
            const { data } = await api.get<TrackedPair[]>('/pairs', conf);
            return data;
        },
        enabled: !!auth.currentUser
    });
};

// 3. Track New Pair
export const useTrackPair = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { coin_id: string; vs_currency: string }) => {
            const conf = await getAuthHeaders();
            return api.post('/pairs', payload, conf);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pairs'] })
    });
};

// 4. Stop Tracking (DELETE)
export const useStopTracking = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { coin_id: string; vs_currency: string }) => {
            const conf = await getAuthHeaders();
            return api.delete(`/pairs/${payload.coin_id}/${payload.vs_currency}`, conf);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pairs'] })
    });
};

export const useCoinList = () => {
    return useQuery({
        queryKey: ['coins'],
        queryFn: async () => {
            const conf = await getAuthHeaders();
            const { data } = await api.get('/coins/list', conf);
            return data as { id: string; symbol: string; name: string; image?: string; current_price?: number }[];
        },
        enabled: !!auth.currentUser,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};