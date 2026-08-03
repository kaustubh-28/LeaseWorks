import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';

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

export async function getBuildingById(id: string, currentUserId?: string) {
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

  if (currentUserId && building.userId !== currentUserId) {
    throw new AuthorizationError('You do not have access to this building');
  }

  return building;
}

export async function createBuilding(data: any) {
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

export async function updateBuilding(id: string, data: any, currentUserId?: string) {
  const existing = await getBuildingById(id, currentUserId);

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

export async function deleteBuilding(id: string, currentUserId?: string) {
  await getBuildingById(id, currentUserId);

  return prisma.building.delete({
    where: { id }
  });
}
