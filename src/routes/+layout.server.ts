import type { LayoutServerLoad } from './$types';
import { getUrgentMaintenanceAlerts } from '$lib/server/services/maintenance.service';
import prisma from '$lib/server/prisma';

export const load: LayoutServerLoad = async ({ locals }) => {
    let urgentAlert = null;

    if (locals.user && locals.user.role === 'LANDLORD') {
        try {
            // Fetch buildings for landlord to extract apartment IDs
            const buildings = await prisma.building.findMany({
                where: { userId: locals.user.id },
                select: { id: true }
            });
            const buildingIds = buildings.map(b => b.id);

            const apartments = await prisma.apartment.findMany({
                where: { buildingId: { in: buildingIds } },
                select: { id: true }
            });
            const apartmentIds = apartments.map(a => a.id);

            // Retrieve the single most recent urgent request
            const alerts = await getUrgentMaintenanceAlerts(apartmentIds, 1);
            if (alerts.length > 0) {
                urgentAlert = JSON.parse(JSON.stringify(alerts[0]));
            }
        } catch (error) {
            console.error('Error fetching urgent alert in layout:', error);
        }
    }

    return {
        user: locals.user,
        urgentAlert
    };
};