import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageCost, canViewCost } from '../auth/policies';

export async function getAllCosts() {
  return prisma.cost.findMany({
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function getCostById(id: string, user?: UserSession) {
  const cost = await prisma.cost.findUnique({
    where: { id },
    include: {
      building: true,
      apartment: {
        include: { building: true }
      }
    }
  });

  if (!cost) {
    throw new NotFoundError(`Cost record with ID ${id} not found`);
  }

  if (user) {
    const buildingOwnerId = cost.building?.userId || cost.apartment?.building?.userId || '';
    if (!canViewCost(user, buildingOwnerId)) {
      throw new AuthorizationError('You do not have access to view this cost');
    }
  }

  return cost;
}

export async function createCost(data: any, user?: UserSession) {
  const { buildingId, apartmentId, ...rest } = data;

  let buildingOwnerId = '';
  if (buildingId) {
    const b = await prisma.building.findUnique({ where: { id: buildingId } });
    if (!b) throw new NotFoundError(`Building with ID ${buildingId} not found`);
    buildingOwnerId = b.userId;
  } else if (apartmentId) {
    const a = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { building: true }
    });
    if (!a) throw new NotFoundError(`Apartment with ID ${apartmentId} not found`);
    buildingOwnerId = a.building.userId;
  }

  if (user && !canManageCost(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage costs for this property');
  }

  const payload: any = { ...rest };
  if (buildingId) {
    payload.building = { connect: { id: buildingId } };
  }
  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.cost.create({
    data: payload,
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function updateCost(id: string, data: any, user?: UserSession) {
  const existing = await getCostById(id, user);

  const buildingOwnerId = existing.building?.userId || existing.apartment?.building?.userId || '';
  if (user && !canManageCost(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage this cost');
  }

  const { buildingId, apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (buildingId) {
    payload.building = { connect: { id: buildingId } };
    payload.apartment = { disconnect: true };
  } else if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
    payload.building = { disconnect: true };
  } else {
    payload.building = { disconnect: true };
    payload.apartment = { disconnect: true };
  }

  return prisma.cost.update({
    where: { id },
    data: payload,
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function deleteCost(id: string, user?: UserSession) {
  const existing = await getCostById(id, user);

  const buildingOwnerId = existing.building?.userId || existing.apartment?.building?.userId || '';
  if (user && !canManageCost(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage this cost');
  }

  return prisma.cost.delete({
    where: { id }
  });
}

export async function getTotalOutgoingCosts(buildingIds: string[]) {
  const costs = await prisma.cost.findMany({
    where: { buildingId: { in: buildingIds } },
    select: { amount: true }
  });
  return costs.reduce((sum, c) => sum + c.amount, 0);
}
