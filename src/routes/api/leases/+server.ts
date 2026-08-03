import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllLeases, createLease } from '$lib/server/services/lease.service';
import { validateLease } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all leases
export const GET: RequestHandler = async () => {
    try {
        const leases = await getAllLeases();
        return json(leases);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new lease
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateLease(rawData);
        
        const lease = await createLease(validatedData);
        return json(lease, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};