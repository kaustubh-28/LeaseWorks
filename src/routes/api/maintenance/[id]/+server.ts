import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// PATCH to update maintenance request status
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ error: 'Missing request ID' }, { status: 400 });
    }

    try {
        const { status } = await request.json();
        
        if (!status) {
            return json({ error: 'Status is required' }, { status: 400 });
        }

        // Verify request exists
        const existing = await prisma.maintenanceRequest.findUnique({
            where: { id }
        });

        if (!existing) {
            return json({ error: 'Maintenance request not found' }, { status: 404 });
        }

        // Update the status
        const updated = await prisma.maintenanceRequest.update({
            where: { id },
            data: { status }
        });

        return json({ success: true, request: updated });
    } catch (error) {
        console.error('Error updating maintenance request:', error);
        return json({
            error: 'Failed to update maintenance request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
