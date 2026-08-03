import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getLandlordPortfolio } from '$lib/server/services/building.service';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'LANDLORD') {
        throw redirect(303, '/login');
    }

    try {
        const userId = locals.user.id;
        const portfolio = await getLandlordPortfolio(userId);

        return {
            buildings: JSON.parse(JSON.stringify(portfolio.buildings)),
            maintenanceRequests: JSON.parse(JSON.stringify(portfolio.maintenanceRequests))
        };
    } catch (error) {
        console.error('Error loading landlord dashboard data:', error);
        return {
            buildings: [],
            maintenanceRequests: []
        };
    }
};
