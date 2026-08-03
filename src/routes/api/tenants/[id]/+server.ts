import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTenantById, updateTenant, deleteTenant } from '$lib/server/services/tenant.service';
import { validateTenant } from '$lib/server/validation';
import { handleServiceError } from '$lib/server/errors';

// GET a specific tenant by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const tenant = await getTenantById(params.id);
        return json(tenant);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a tenant
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validateTenant(rawData);

        const tenant = await updateTenant(params.id, validatedData);
        return json(tenant);
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a tenant
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deleteTenant(params.id);
        return json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};