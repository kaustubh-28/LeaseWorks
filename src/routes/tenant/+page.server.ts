import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

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
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { address: true }
        });

        // Fetch active lease
        const lease = await prisma.lease.findFirst({
            where: { tenantId },
            include: {
                apartment: {
                    include: {
                        building: {
                            include: {
                                address: true,
                                user: true // Owner / Landlord details
                            }
                        }
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        });

        if (!lease) {
            return {
                tenant,
                lease: null,
                payments: [],
                maintenanceRequests: []
            };
        }

        // Fetch payments for this apartment
        const payments = await prisma.payment.findMany({
            where: { apartmentId: lease.apartmentId },
            orderBy: { dueDate: 'desc' }
        });

        // Fetch maintenance requests
        const maintenanceRequests = await prisma.maintenanceRequest.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

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
