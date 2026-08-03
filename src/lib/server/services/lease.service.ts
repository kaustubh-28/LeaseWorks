import prisma from '../prisma';
import { NotFoundError } from '../errors';

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

export async function getLeaseById(id: string) {
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

  return lease;
}

export async function createLease(data: any) {
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

export async function updateLease(id: string, data: any) {
  await getLeaseById(id);

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

export async function deleteLease(id: string) {
  await getLeaseById(id);

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
