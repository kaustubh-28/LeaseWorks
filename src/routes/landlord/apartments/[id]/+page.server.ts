import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'LANDLORD') {
        throw redirect(303, '/login');
    }

    try {
        const id = params.id;

        // Fetch apartment with all its related leases, payments, costs, and address info
        const apartment = await prisma.apartment.findUnique({
            where: { id },
            include: {
                building: {
                    include: { address: true }
                },
                leases: {
                    include: { 
                        tenant: true
                    },
                    orderBy: { startDate: 'desc' }
                },
                payments: {
                    orderBy: { dueDate: 'desc' }
                },
                costs: {
                    orderBy: { occurredAt: 'desc' }
                },
                meters: true
            }
        });

        if (!apartment) {
            throw error(404, 'Apartment not found');
        }

        // Fetch maintenance requests for this apartment
        const maintenanceRequests = await prisma.maintenanceRequest.findMany({
            where: { apartmentId: id },
            include: { tenant: true },
            orderBy: { createdAt: 'desc' }
        });

        return {
            apartment: JSON.parse(JSON.stringify(apartment)),
            maintenanceRequests: JSON.parse(JSON.stringify(maintenanceRequests))
        };
    } catch (err: any) {
        console.error('Error loading apartment details:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};
