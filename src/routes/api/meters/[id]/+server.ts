import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMeterById, updateMeter, deleteMeter } from '$lib/server/services/meter.service';
import { validateMeter } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific meter by ID
export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const meter = await getMeterById(params.id, locals.user || undefined);
        return json(meter);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a meter
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateMeter(rawData);

        const meter = await updateMeter(params.id, validatedData, locals.user || undefined);
        return json(meter);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a meter
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        await deleteMeter(params.id, locals.user || undefined);
        return json({ message: 'Meter deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};