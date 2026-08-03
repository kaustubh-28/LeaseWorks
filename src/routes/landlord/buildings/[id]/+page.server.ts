import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBuildingDetail } from '$lib/server/services/building.service';
import { NotFoundError, AuthorizationError } from '$lib/server/errors';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'LANDLORD') {
        throw redirect(303, '/login');
    }

    try {
        const buildingId = params.id;
        const building = await getBuildingDetail(buildingId, locals.user);

        // Fetch all maintenance requests for this building's apartments
        const maintenanceRequests = await prisma.maintenanceRequest.findMany({
            where: {
                apartment: {
                    buildingId: building.id
                }
            },
            include: {
                apartment: true,
                tenant: true
            }
        });

        return {
            building: JSON.parse(JSON.stringify(building)),
            maintenanceRequests: JSON.parse(JSON.stringify(maintenanceRequests))
        };
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw error(404, err.message);
        }
        if (err instanceof AuthorizationError) {
            throw error(403, err.message);
        }
        console.error('Error loading building details:', err);
        throw error(500, 'Internal Server Error');
    }
};
