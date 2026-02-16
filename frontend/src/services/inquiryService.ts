import { Inquiry } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createInquiry = async (inquiryData: Partial<Inquiry>): Promise<Inquiry> => {
    const response = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit inquiry');
    }

    return response.json();
};
