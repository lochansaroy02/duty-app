// store/dutyStore.ts
import axios from 'axios';
import { create } from 'zustand';

interface DutyState {
    duties: any[];
    isLoading: boolean;
    error: string | null;
    fetchDuties: (stationId: string | undefined) => Promise<void>;
    // Updated to handle the API response correctly
    createDuty: (dutyData: any) => Promise<{ success: boolean; message?: string }>;
}

export const useDutyStore = create<DutyState>((set) => ({
    duties: [],
    isLoading: false,
    error: null,

    fetchDuties: async (stationId: string | undefined) => {
        if (!stationId) return;
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/api/duty?stationId=${stationId}`);
            // Your backend returns { data: duties }
            set({ duties: response.data.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createDuty: async (dutyData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/duty', dutyData);
            set((state) => ({
                // Re-fetch or manually update
                isLoading: false,
            }));
            return { success: true };
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            return { success: false, message: err.message };
        }
    },
}));