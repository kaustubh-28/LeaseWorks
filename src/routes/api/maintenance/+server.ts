import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET maintenance requests
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const where = locals.user.role === 'LANDLORD'
            ? { apartment: { building: { userId: locals.user.id } } }
            : { tenantId: locals.user.tenantId || '' };

        const requests = await prisma.maintenanceRequest.findMany({
            where,
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
            }
        });

        return json(requests);
    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        return json({
            error: 'Failed to fetch maintenance requests',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

// POST a new maintenance request (Tenant only)
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (locals.user.role !== 'TENANT') {
        return json({ error: 'Only tenants can report maintenance issues' }, { status: 403 });
    }

    const tenantId = locals.user.tenantId;
    if (!tenantId) {
        return json({ error: 'No tenant profile associated with this user' }, { status: 400 });
    }

    try {
        const { title, category, urgency, description } = await request.json();

        if (!title || !category || !description) {
            return json({ error: 'Title, category, and description are required' }, { status: 400 });
        }

        // Find active lease to get apartmentId
        const activeLease = await prisma.lease.findFirst({
            where: { tenantId: tenantId }
        });

        if (!activeLease) {
            return json({ error: 'No active lease found for this tenant' }, { status: 400 });
        }

        const newRequest = await prisma.maintenanceRequest.create({
            data: {
                title,
                category,
                urgency: urgency || 'MEDIUM',
                description,
                status: 'PENDING',
                apartmentId: activeLease.apartmentId,
                tenantId: tenantId
            }
        });

        return json({ success: true, request: newRequest }, { status: 201 });
    } catch (error) {
        console.error('Error creating maintenance request:', error);
        return json({
            error: 'Failed to create maintenance request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
