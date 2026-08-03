import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET finance and request stats for Landlord Dashboard
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (locals.user.role !== 'LANDLORD') {
        return json({ error: 'Only landlords can view financial statistics' }, { status: 403 });
    }

    try {
        const userId = locals.user.id;

        // Fetch all buildings for this landlord
        const buildings = await prisma.building.findMany({
            where: { userId },
            select: { id: true }
        });
        const buildingIds = buildings.map(b => b.id);

        // Calculate Outgoing costs for these buildings
        const costs = await prisma.cost.findMany({
            where: {
                buildingId: { in: buildingIds }
            },
            select: { amount: true }
        });
        const outgoing = costs.reduce((sum, c) => sum + c.amount, 0);

        // Fetch apartments in these buildings
        const apartments = await prisma.apartment.findMany({
            where: {
                buildingId: { in: buildingIds }
            },
            select: { id: true }
        });
        const apartmentIds = apartments.map(a => a.id);

        // Calculate Incoming rent payments (Paid status)
        const paidPayments = await prisma.payment.findMany({
            where: {
                apartmentId: { in: apartmentIds },
                status: 'paid'
            },
            select: { amount: true }
        });
        const incoming = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        // Count active maintenance requests (PENDING or IN_PROGRESS)
        const activeRequestsCount = await prisma.maintenanceRequest.count({
            where: {
                apartmentId: { in: apartmentIds },
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });

        // Get latest urgent maintenance alerts (status PENDING/IN_PROGRESS and urgency HIGH/EMERGENCY)
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
                            include: {
                                address: true
                            }
                        }
                    }
                },
                tenant: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 3
        });

        return json({
            incoming,
            outgoing,
            net: incoming - outgoing,
            activeRequestsCount,
            urgentAlerts
        });
    } catch (error) {
        console.error('Error fetching financial stats:', error);
        return json({
            error: 'Failed to fetch financial stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
