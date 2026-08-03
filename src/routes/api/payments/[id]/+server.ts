import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPaymentById, updatePayment, deletePayment } from '$lib/server/services/payment.service';
import { validatePayment } from '$lib/server/validation';
import { handleServiceError, AuthorizationError } from '$lib/server/errors';

// GET a specific payment by ID
export const GET: RequestHandler = async ({ params }) => {
    try {
        const payment = await getPaymentById(params.id);
        return json(payment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PUT to update a payment
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const rawData = await request.json();
        
        // Remove DB metadata fields
        delete rawData.id;
        delete rawData.createdAt;
        delete rawData.updatedAt;

        // Authoritative request validation
        const validatedData = validatePayment(rawData);

        const payment = await updatePayment(params.id, validatedData);
        return json(payment);
    } catch (error) {
        return handleServiceError(error);
    }
};

// PATCH to update payment status
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        if (!locals.user) {
            throw new AuthorizationError('Unauthorized');
        }

        const { id } = params;
        const { status } = await request.json();

        if (!status) {
            return json({ error: 'Status is required' }, { status: 400 });
        }

        // Fetch existing using service
        const existing = await getPaymentById(id);

        // Update payment status using service
        const updated = await updatePayment(id, {
            ...existing,
            status
        });

        return json({ success: true, payment: updated });
    } catch (error) {
        return handleServiceError(error);
    }
};

// DELETE a payment
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        await deletePayment(params.id);
        return json({ message: 'Payment deleted successfully' });
    } catch (error) {
        return handleServiceError(error);
    }
};
