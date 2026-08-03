import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAddress, getAllAddresses } from '$lib/server/services/address.service';
import { validateAddress } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all addresses
export const GET: RequestHandler = async () => {
    try {
        const addresses = await getAllAddresses();
        return json(addresses);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new address
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateAddress(rawData);
        
        const address = await createAddress(validatedData);
        return json(address, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};