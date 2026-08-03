import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaseById, updateLease, deleteLease } from '$lib/server/services/lease.service';
import { validateLease } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific lease by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const lease = await getLeaseById(params.id);
        return json(lease);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a lease
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateLease(rawData);

        const lease = await updateLease(params.id, validatedData);
        return json(lease);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a lease
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deleteLease(params.id);
        return json({ message: 'Lease deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};