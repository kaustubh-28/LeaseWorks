import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantById } from '$lib/server/services/tenant.service';
import { getLeaseByTenantId } from '$lib/server/services/lease.service';
import { getPaymentsByApartmentId } from '$lib/server/services/payment.service';
import { getMaintenanceRequestsByTenantId } from '$lib/server/services/maintenance.service';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'TENANT') {
        throw redirect(303, '/login');
    }

    const tenantId = locals.user.tenantId;
    if (!tenantId) {
        throw redirect(303, '/login');
    }

    try {
        // Fetch Tenant profile
        const tenant = await getTenantById(tenantId);

        // Fetch active lease
        const lease = await getLeaseByTenantId(tenantId);

        if (!lease) {
            return {
                tenant,
                lease: null,
                payments: [],
                maintenanceRequests: []
            };
        }

        // Fetch payments for this apartment
        const payments = await getPaymentsByApartmentId(lease.apartmentId);

        // Fetch maintenance requests
        const maintenanceRequests = await getMaintenanceRequestsByTenantId(tenantId);

        return {
            tenant,
            lease: JSON.parse(JSON.stringify(lease)),
            payments: JSON.parse(JSON.stringify(payments)),
            maintenanceRequests: JSON.parse(JSON.stringify(maintenanceRequests))
        };
    } catch (error) {
        console.error('Error loading tenant dashboard data:', error);
        return {
            tenant: null,
            lease: null,
            payments: [],
            maintenanceRequests: []
        };
    }
};
