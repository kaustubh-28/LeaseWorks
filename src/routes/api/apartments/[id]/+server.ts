import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApartmentById, updateApartment, deleteApartment } from '$lib/server/services/apartment.service';
import { validateApartment } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific apartment by ID
export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const apartment = await getApartmentById(params.id, locals.user || undefined);
        return json(apartment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update an apartment
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateApartment(rawData);

        const apartment = await updateApartment(params.id, validatedData, locals.user || undefined);
        return json(apartment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE an apartment
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        await deleteApartment(params.id, locals.user || undefined);
        return json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};