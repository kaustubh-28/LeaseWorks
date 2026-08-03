import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllCosts, createCost } from '$lib/server/services/cost.service';
import { validateCost } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all costs
export const GET: RequestHandler = async () => {
    try {
        const costs = await getAllCosts();
        return json(costs);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new cost
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateCost(rawData);
        
        const cost = await createCost(validatedData);
        return json(cost, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};