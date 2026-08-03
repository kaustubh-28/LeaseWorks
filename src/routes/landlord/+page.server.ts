import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'LANDLORD') {
        throw redirect(303, '/login');
    }

    try {
        const userId = locals.user.id;

        // Fetch buildings
        const buildings = await prisma.building.findMany({
            where: { userId },
            include: { address: true }
        });
        const buildingIds = buildings.map(b => b.id);

        // Fetch apartments with active leases and payments
        const apartments = await prisma.apartment.findMany({
            where: { buildingId: { in: buildingIds } },
            include: {
                building: {
                    include: { address: true }
                },
                leases: {
                    include: { tenant: true },
                    orderBy: { startDate: 'desc' }
                },
                payments: {
                    orderBy: { dueDate: 'desc' }
                }
            }
        });

        // Calculate statistics
        // 1. Outgoing costs
        const costs = await prisma.cost.findMany({
            where: { buildingId: { in: buildingIds } },
            select: { amount: true }
        });
        const outgoing = costs.reduce((sum, c) => sum + c.amount, 0);

        // 2. Incoming paid payments
        const apartmentIds = apartments.map(a => a.id);
        const paidPayments = await prisma.payment.findMany({
            where: {
                apartmentId: { in: apartmentIds },
                status: 'paid'
            },
            select: { amount: true }
        });
        const incoming = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        // 3. Count active maintenance requests
        const activeRequestsCount = await prisma.maintenanceRequest.count({
            where: {
                apartmentId: { in: apartmentIds },
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });

        // 4. Get urgent alerts
        const urgentAlerts = await prisma.maintenanceRequest.findMany({
            where: {
                apartmentId: { in: apartmentIds },
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                urgency: { in: ['HIGH', 'EMERGENCY'] }
            },
            include: {
                apartment: {
                    include: {
                        building: {
                            include: { address: true }
                        }
                    }
                },
                tenant: true
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        return {
            buildings,
            apartments,
            stats: {
                incoming,
                outgoing,
                net: incoming - outgoing,
                activeRequestsCount,
                urgentAlerts: JSON.parse(JSON.stringify(urgentAlerts)) // Convert Date objects to JSON-safe formats
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
