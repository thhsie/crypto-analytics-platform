import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthHeaders } from '../api/client';
import { auth } from '../config/firebase';

// 1. Fetch Historical Data (Chart)
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
        refetchInterval: 60000 // Poll every minute
    });
};

// 2. Fetch Active Tracked Pairs (List) - THIS WAS MISSING
export const useTrackedPairs = () => {
    return useQuery({
        queryKey: ['pairs'],
        queryFn: async () => {
            const conf = await getAuthHeaders();
            const { data } = await api.get('/pairs', conf);
            return data as { coin_id: string; vs_currency: string; status: string }[];
        },
        enabled: !!auth.currentUser
    });
};

// 3. Track New Pair (Mutation)
export const useTrackPair = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { coin_id: string; vs_currency: string }) => {
            const conf = await getAuthHeaders();
            return api.post('/pairs', payload, conf);
        },
        onSuccess: () => {
            // Refetch the pairs list immediately after tracking
            qc.invalidateQueries({ queryKey: ['pairs'] });
        }
    });
};