import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApartmentById, updateApartment, deleteApartment } from '$lib/server/services/apartment.service';
import { validateApartment } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific apartment by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const apartment = await getApartmentById(params.id);
        return json(apartment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update an apartment
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateApartment(rawData);

        const apartment = await updateApartment(params.id, validatedData);
        return json(apartment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE an apartment
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deleteApartment(params.id);
        return json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};