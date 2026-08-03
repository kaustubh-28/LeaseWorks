import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAddressById, updateAddress, deleteAddress } from '$lib/server/services/address.service';
import { validateAddress } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific address by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const address = await getAddressById(params.id);
        return json(address);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update an address
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateAddress(rawData);

        const address = await updateAddress(params.id, validatedData);
        return json(address);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE an address
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deleteAddress(params.id);
        return json({ message: 'Address deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};