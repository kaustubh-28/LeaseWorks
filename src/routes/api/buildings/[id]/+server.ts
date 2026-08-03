import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBuildingById, updateBuilding, deleteBuilding } from '$lib/server/services/building.service';
import { validateBuilding } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific building by ID
export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const building = await getBuildingById(params.id, locals.user || undefined);
        return json(building);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a building
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    try {
        const rawData = await request.json();

        // Inject owner user ID
        if (!rawData.userId && locals.user) {
            rawData.userId = locals.user.id;
        }

        // Authoritative request validation
        const validatedData = validateBuilding(rawData);

        const building = await updateBuilding(params.id, validatedData, locals.user || undefined);
        return json(building);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a building
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        await deleteBuilding(params.id, locals.user || undefined);
        return json({ message: 'Building deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};