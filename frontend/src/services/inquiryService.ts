import { Inquiry } from '@/types';
import { apiRequest } from './apiClient';

/**
 * Map backend inquiry to frontend Inquiry interface
 */
const mapInquiry = (i: any): Inquiry => ({
    id: i._id || i.id,
    carId: i.car?._id || i.car,
    carName: i.car?.name ? `${i.car.brand} ${i.car.name}` : 'Inquiry about Car',
    customerName: i.customerName,
    email: i.email,
    phone: i.phone,
    message: i.message,
    type: i.type,
    status: i.status,
    createdAt: i.createdAt,
});

/**
 * Submit a new inquiry
 */
export const createInquiry = async (inquiryData: Partial<Inquiry>): Promise<Inquiry | null> => {
    const response = await apiRequest<any>('/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiryData),
    });

    if (response.success && response.data) {
        return mapInquiry(response.data);
    }

    throw new Error(response.error || 'Failed to submit inquiry');
};

/**
 * Get all inquiries (Admin only)
 */
export const getInquiries = async (): Promise<Inquiry[]> => {
    const response = await apiRequest<any[]>('/inquiries');
    if (response.success && response.data) {
        return response.data.map(mapInquiry);
    }
    return [];
};

/**
 * Update inquiry status (Admin only)
 */
export const updateInquiry = async (id: string, data: Partial<Inquiry>): Promise<Inquiry | null> => {
    const response = await apiRequest<any>(`/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (response.success && response.data) {
        return mapInquiry(response.data);
    }
    return null;
};
