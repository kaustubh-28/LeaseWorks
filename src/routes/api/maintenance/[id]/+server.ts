import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMaintenanceRequestById, updateMaintenanceRequest } from '$lib/server/services/maintenance.service';
import { handleServiceError, AuthorizationError } from '$lib/server/errors';

// PATCH to update maintenance request status
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        if (!locals.user) {
            throw new AuthorizationError('Unauthorized');
        }

        const { id } = params;
        const { status } = await request.json();
        
        if (!status) {
            return json({ error: 'Status is required' }, { status: 400 });
        }

        // Retrieve existing using service
        const existing = await getMaintenanceRequestById(id, locals.user);

        // Update request using service
        const updated = await updateMaintenanceRequest(id, {
            ...existing,
            status
        }, locals.user);

        return json({ success: true, request: updated });
    } catch (error) {
        return handleServiceError(error);
    }
};
