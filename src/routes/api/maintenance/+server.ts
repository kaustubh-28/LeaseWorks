import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllMaintenanceRequestsFiltered, createTenantMaintenanceRequest } from '$lib/server/services/maintenance.service';
import { validateMaintenanceRequest } from '$lib/server/validation';
import { handleServiceError, AuthorizationError, ValidationError } from '$lib/server/errors';

// GET maintenance requests
export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw new AuthorizationError('Unauthorized');
        }

        const role = locals.user.role;
        const userId = locals.user.id;
        const tenantId = locals.user.tenantId;

        const requests = await getAllMaintenanceRequestsFiltered(role, userId, tenantId);
        return json(requests);
    } catch (error) {
        return handleServiceError(error);
    }
};

// POST a new maintenance request (Tenant only)
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            throw new AuthorizationError('Unauthorized');
        }

        if (locals.user.role !== 'TENANT') {
            throw new AuthorizationError('Only tenants can report maintenance issues');
        }

        const tenantId = locals.user.tenantId;
        if (!tenantId) {
            throw new ValidationError({ tenant: 'No tenant profile associated with this user' });
        }

        const rawData = await request.json();

        // Inject default values that are required by schema but calculated on the backend
        rawData.tenantId = tenantId;
        rawData.apartmentId = 'temp'; // will be resolved in service
        rawData.status = 'PENDING';

        const validatedData = validateMaintenanceRequest(rawData);

        const newRequest = await createTenantMaintenanceRequest(tenantId, validatedData);
        return json({ success: true, request: newRequest }, { status: 201 });
    } catch (error) {
        return handleServiceError(error);
    }
};
