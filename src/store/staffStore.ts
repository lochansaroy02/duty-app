interface Staff {
    id: string;
    name: string;
    forceNo: string;
    rank: string;
    mobileNumber?: string;
    status?: string,
    policeStationId: string;
    duties?: any[]; // Replace 'any' with your specific Duty type
    leaves?: any[]; // Replace 'any' with your specific Leave type
    createdAt: string;
}

interface StaffState {
    staffList: Staff[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchStaff: (stationId: string | undefined) => Promise<any>;
    createStaff: (staffData: any) => Promise<{ success: boolean; message?: string }>;
    fetchStaffById: (staffId: string | undefined) => Promise<any>
}


import axios from 'axios';
import { create } from 'zustand';

export const useStaffStore = create<StaffState>((set, get) => ({
    staffList: [],
    isLoading: false,
    error: null,

    // FETCH ALL STAFF
    fetchStaff: async (stationId: string | undefined) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/api/staff?stationId=${stationId}`);
            const data = await response.data;
            set({ staffList: data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // CREATE NEW STAFF
    createStaff: async (staffData,) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/staff', staffData);

            const result = await response.data


            // Update the local state immediately so the UI reflects changes
            set((state) => ({
                staffList: [result, ...state.staffList],
                isLoading: false,
            }));

            return { success: true };
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            return { success: false, message: err.message };
        }
    },
    fetchStaffById: async (staffId: string | undefined) => {
        try {
            const res = await axios.get(`/api/staff/by-id?staffId=${staffId}`);
            return res.data
        } catch (error) {
            return {
                success: false, message: error
            }
        }
    }
}));