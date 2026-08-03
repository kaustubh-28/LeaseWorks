import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// PATCH payment status
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ error: 'Missing payment ID' }, { status: 400 });
    }

    try {
        const { status } = await request.json();

        if (!status) {
            return json({ error: 'Status is required' }, { status: 400 });
        }

        // Fetch existing payment
        const existing = await prisma.payment.findUnique({
            where: { id }
        });

        if (!existing) {
            return json({ error: 'Payment not found' }, { status: 404 });
        }

        // Update payment status
        const updated = await prisma.payment.update({
            where: { id },
            data: { status }
        });

        return json({ success: true, payment: updated });
    } catch (error) {
        console.error('Error updating payment status:', error);
        return json({
            error: 'Failed to update payment status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
