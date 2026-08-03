import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllMeters, createMeter } from '$lib/server/services/meter.service';
import { validateMeter } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all meters
export const GET: RequestHandler = async () => {
    try {
        const meters = await getAllMeters();
        return json(meters);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new meter
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateMeter(rawData);
        
        const meter = await createMeter(validatedData, locals.user || undefined);
        return json(meter, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};