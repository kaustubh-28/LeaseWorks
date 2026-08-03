import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllApartments, createApartment } from '$lib/server/services/apartment.service';
import { validateApartment } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all apartments
export const GET: RequestHandler = async () => {
    try {
        const apartments = await getAllApartments();
        return json(apartments);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new apartment
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateApartment(rawData);
        
        const apartment = await createApartment(validatedData);
        return json(apartment, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};