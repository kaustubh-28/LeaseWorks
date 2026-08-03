import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllBuildings } from '$lib/server/services/building.service';
import { getLandlordApartments } from '$lib/server/services/apartment.service';
import { getTotalOutgoingCosts } from '$lib/server/services/cost.service';
import { getTotalIncomingPayments } from '$lib/server/services/payment.service';
import { 
    getActiveMaintenanceRequestsCount, 
    getUrgentMaintenanceAlerts 
} from '$lib/server/services/maintenance.service';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'LANDLORD') {
        throw redirect(303, '/login');
    }

    try {
        const userId = locals.user.id;

        // Fetch buildings via BuildingService
        const buildings = await getAllBuildings(userId);
        const buildingIds = buildings.map(b => b.id);

        // Fetch apartments with active leases and payments via ApartmentService
        const apartments = await getLandlordApartments(buildingIds);
        const apartmentIds = apartments.map(a => a.id);

        // Calculate statistics via services
        const outgoing = await getTotalOutgoingCosts(buildingIds);
        const incoming = await getTotalIncomingPayments(apartmentIds);
        const activeRequestsCount = await getActiveMaintenanceRequestsCount(apartmentIds);
        const urgentAlerts = await getUrgentMaintenanceAlerts(apartmentIds, 3);

        return {
            buildings,
            apartments,
            stats: {
                incoming,
                outgoing,
                net: incoming - outgoing,
                activeRequestsCount,
                urgentAlerts: JSON.parse(JSON.stringify(urgentAlerts)) // JSON date serialization fallback
            }
        };
    } catch (error) {
        console.error('Error loading landlord dashboard data:', error);
        return {
            buildings: [],
            apartments: [],
            stats: {
                incoming: 0,
                outgoing: 0,
                net: 0,
                activeRequestsCount: 0,
                urgentAlerts: []
            }
        };
    }
};
