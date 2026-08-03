import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllBuildings, createBuilding } from '$lib/server/services/building.service';
import { validateBuilding } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all buildings
export const GET: RequestHandler = async ({ locals }) => {
    try {
        const userId = locals.user?.id;
        const buildings = await getAllBuildings(userId);
        return json(buildings);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new building
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const rawData = await request.json();

        // Inject current landlord ID if not provided in payload
        if (!rawData.userId && locals.user) {
            rawData.userId = locals.user.id;
        }

        // Authoritative request validation
        const validatedData = validateBuilding(rawData);

        const building = await createBuilding(validatedData);
        return json(building, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};