import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManagePayment, canViewPayment } from '../auth/policies';

export async function getAllPayments() {
  return prisma.payment.findMany({
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function getPaymentById(id: string, user?: UserSession) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      apartment: {
        include: {
          building: {
            include: { address: true }
          }
        }
      }
    }
  });

  if (!payment) {
    throw new NotFoundError(`Payment with ID ${id} not found`);
  }

  if (user) {
    const buildingOwnerId = payment.apartment.building.userId;
    // Check if the tenant has a lease on this apartment
    const hasLease = user.tenantId ? await prisma.lease.findFirst({
      where: { apartmentId: payment.apartmentId, tenantId: user.tenantId }
    }) : null;
    const tenantId = hasLease ? user.tenantId : null;

    if (!canViewPayment(user, buildingOwnerId, tenantId)) {
      throw new AuthorizationError('You do not have access to view this payment');
    }
  }

  return payment;
}

export async function createPayment(data: any, user?: UserSession) {
  if (user && !canManagePayment(user)) {
    throw new AuthorizationError('Only landlords can manage payments');
  }

  const { apartmentId, ...rest } = data;
  return prisma.payment.create({
    data: {
      ...rest,
      apartment: { connect: { id: apartmentId } }
    },
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function updatePayment(id: string, data: any, user?: UserSession) {
  const existing = await getPaymentById(id, user);

  if (user && !canManagePayment(user)) {
    throw new AuthorizationError('Only landlords can manage payments');
  }

  const { apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.payment.update({
    where: { id },
    data: payload,
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function deletePayment(id: string, user?: UserSession) {
  const existing = await getPaymentById(id, user);

  if (user && !canManagePayment(user)) {
    throw new AuthorizationError('Only landlords can manage payments');
  }

  return prisma.payment.delete({
    where: { id }
  });
}

export async function getTotalIncomingPayments(apartmentIds: string[]) {
  const paidPayments = await prisma.payment.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      status: 'paid'
    },
    select: { amount: true }
  });
  return paidPayments.reduce((sum, p) => sum + p.amount, 0);
}

export async function getPaymentsByApartmentId(apartmentId: string) {
  return prisma.payment.findMany({
    where: { apartmentId },
    orderBy: { dueDate: 'desc' }
  });
}
