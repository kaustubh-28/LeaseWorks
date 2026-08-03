import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTenants, createTenant } from '$lib/server/services/tenant.service';
import { validateTenant } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET all tenants
export const GET: RequestHandler = async () => {
    try {
        const tenants = await getAllTenants();
        return json(tenants);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new tenant
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawData = await request.json();
        
        // Authoritative request validation
        const validatedData = validateTenant(rawData);
        
        const tenant = await createTenant(validatedData);
        return json(tenant, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};