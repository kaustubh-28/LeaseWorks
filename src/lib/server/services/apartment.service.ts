import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageApartment, canViewApartment } from '../auth/policies';

export async function getAllApartments() {
  return prisma.apartment.findMany({
    include: {
      building: {
        include: { address: true }
      }
    }
  });
}

export async function getApartmentById(id: string, user?: UserSession) {
  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      meters: true,
      costs: true,
      payments: true,
      leases: {
        include: {
          tenant: true
        }
      },
      building: {
        include: {
          meters: true,
          costs: true,
          address: true
        }
      }
    }
  });

  if (!apartment) {
    throw new NotFoundError(`Apartment with ID ${id} not found`);
  }

  if (user) {
    const buildingOwnerId = apartment.building.userId;
    // Check if user is tenant of any lease in this apartment
    const isTenant = apartment.leases.some(l => l.tenantId === user.tenantId);
    const activeTenantId = isTenant ? user.tenantId : null;

    if (!canViewApartment(user, buildingOwnerId, activeTenantId)) {
      throw new AuthorizationError('You do not have access to this apartment');
    }
  }

  return apartment;
}

export async function createApartment(data: any, user?: UserSession) {
  const { buildingId, ...rest } = data;

  const building = await prisma.building.findUnique({
    where: { id: buildingId }
  });
  if (!building) {
    throw new NotFoundError(`Building with ID ${buildingId} not found`);
  }

  if (user && !canManageApartment(user, building.userId)) {
    throw new AuthorizationError('You do not have permission to manage apartments in this building');
  }

  return prisma.apartment.create({
    data: {
      ...rest,
      building: { connect: { id: buildingId } }
    },
    include: {
      building: {
        include: { address: true }
      }
    }
  });
}

export async function updateApartment(id: string, data: any, user?: UserSession) {
  const existing = await getApartmentById(id, user);

  if (user && !canManageApartment(user, existing.building.userId)) {
    throw new AuthorizationError('You do not have permission to manage this apartment');
  }

  const { buildingId, ...rest } = data;
  const updatePayload: any = { ...rest };

  if (buildingId) {
    updatePayload.building = { connect: { id: buildingId } };
  }

  return prisma.apartment.update({
    where: { id },
    data: updatePayload,
    include: {
      meters: true,
      costs: true,
      payments: true,
      leases: {
        include: {
          tenant: true
        }
      },
      building: {
        include: {
          meters: true,
          costs: true,
          address: true
        }
      }
    }
  });
}

export async function deleteApartment(id: string, user?: UserSession) {
  const existing = await getApartmentById(id, user);

  if (user && !canManageApartment(user, existing.building.userId)) {
    throw new AuthorizationError('You do not have permission to manage this apartment');
  }

  return prisma.apartment.delete({
    where: { id }
  });
}

export async function getLandlordApartments(buildingIds: string[]) {
  return prisma.apartment.findMany({
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
}
