import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCostById, updateCost, deleteCost } from '$lib/server/services/cost.service';
import { validateCost } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific cost by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const cost = await getCostById(params.id);
        return json(cost);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a cost
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateCost(rawData);

        const cost = await updateCost(params.id, validatedData);
        return json(cost);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a cost
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deleteCost(params.id);
        return json({ message: 'Cost deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};