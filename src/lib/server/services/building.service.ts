import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageBuilding, canViewBuilding } from '../auth/policies';

export async function getAllBuildings(userId?: string) {
  const where = userId ? { userId } : {};
  return prisma.building.findMany({
    where,
    include: { 
      address: true,
      apartments: true
    }
  });
}

export async function getBuildingById(id: string, user?: UserSession) {
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      apartments: true,
      costs: true,
      meters: true,
      address: true
    }
  });

  if (!building) {
    throw new NotFoundError(`Building with ID ${id} not found`);
  }

  if (user && !canViewBuilding(user, building.userId)) {
    throw new AuthorizationError('You do not have access to this building');
  }

  return building;
}

export async function createBuilding(data: any, user?: UserSession) {
  if (user && user.role !== 'LANDLORD') {
    throw new AuthorizationError('Only landlords can create buildings');
  }

  const { addressId, userId, ...rest } = data;
  return prisma.building.create({
    data: {
      ...rest,
      address: { connect: { id: addressId } },
      user: { connect: { id: userId } }
    },
    include: {
      address: true,
      apartments: true
    }
  });
}

export async function updateBuilding(id: string, data: any, user?: UserSession) {
  const existing = await getBuildingById(id, user);

  if (user && !canManageBuilding(user, existing.userId)) {
    throw new AuthorizationError('You do not have permission to manage this building');
  }

  const { addressId, userId, ...rest } = data;
  const updatePayload: any = {
    name: rest.name,
    floors: rest.floors
  };

  if (addressId) {
    updatePayload.address = { connect: { id: addressId } };
  }

  return prisma.building.update({
    where: { id },
    data: updatePayload,
    include: {
      address: true
    }
  });
}

export async function deleteBuilding(id: string, user?: UserSession) {
  const existing = await getBuildingById(id, user);

  if (user && !canManageBuilding(user, existing.userId)) {
    throw new AuthorizationError('You do not have permission to manage this building');
  }

  return prisma.building.delete({
    where: { id }
  });
}

export async function getLandlordPortfolio(userId: string) {
  const buildings = await prisma.building.findMany({
    where: { userId },
    include: {
      address: true,
      apartments: {
        include: {
          leases: {
            include: { tenant: true }
          },
          payments: true,
          meters: true,
          costs: true
        }
      },
      costs: true,
      meters: true
    }
  });

  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: {
      apartment: {
        building: { userId }
      }
    },
    include: {
      apartment: true,
      tenant: true
    }
  });

  return {
    buildings,
    maintenanceRequests
  };
}

export async function getBuildingDetail(id: string, user?: UserSession) {
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      address: true,
      costs: true,
      meters: true,
      apartments: {
        include: {
          leases: {
            include: { tenant: true },
            orderBy: { startDate: 'desc' }
          },
          payments: {
            orderBy: { dueDate: 'desc' }
          },
          costs: true,
          meters: true
        }
      }
    }
  });

  if (!building) {
    throw new NotFoundError(`Building with ID ${id} not found`);
  }

  if (user && !canViewBuilding(user, building.userId)) {
    throw new AuthorizationError('You do not have access to view this building');
  }

  return building;
}
