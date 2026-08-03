import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageLease, canViewLease } from '../auth/policies';

export async function getAllLeases() {
  return prisma.lease.findMany({
    include: {
      tenant: true,
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function getLeaseById(id: string, user?: UserSession) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      tenant: true,
      apartment: {
        include: {
          building: {
            include: { address: true }
          }
        }
      }
    }
  });

  if (!lease) {
    throw new NotFoundError(`Lease with ID ${id} not found`);
  }

  if (user && !canViewLease(user, lease.apartment.building.userId, lease.tenantId)) {
    throw new AuthorizationError('You do not have access to view this lease');
  }

  return lease;
}

export async function createLease(data: any, user?: UserSession) {
  if (user && !canManageLease(user)) {
    throw new AuthorizationError('Only landlords can manage leases');
  }

  const { tenantId, apartmentId, ...rest } = data;
  return prisma.lease.create({
    data: {
      ...rest,
      tenant: { connect: { id: tenantId } },
      apartment: { connect: { id: apartmentId } }
    },
    include: {
      tenant: true,
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function updateLease(id: string, data: any, user?: UserSession) {
  const existing = await getLeaseById(id, user);

  if (user && !canManageLease(user)) {
    throw new AuthorizationError('Only landlords can manage leases');
  }

  const { tenantId, apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (tenantId) {
    payload.tenant = { connect: { id: tenantId } };
  }
  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.lease.update({
    where: { id },
    data: payload,
    include: {
      tenant: true,
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function deleteLease(id: string, user?: UserSession) {
  const existing = await getLeaseById(id, user);

  if (user && !canManageLease(user)) {
    throw new AuthorizationError('Only landlords can manage leases');
  }

  return prisma.lease.delete({
    where: { id }
  });
}

export async function getLeaseByTenantId(tenantId: string) {
  return prisma.lease.findFirst({
    where: { tenantId },
    include: {
      apartment: {
        include: {
          building: {
            include: {
              address: true,
              user: true
            }
          }
        }
      }
    },
    orderBy: { startDate: 'desc' }
  });
}
