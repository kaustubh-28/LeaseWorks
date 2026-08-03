import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllCosts() {
  return prisma.cost.findMany({
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function getCostById(id: string) {
  const cost = await prisma.cost.findUnique({
    where: { id },
    include: {
      building: true,
      apartment: true
    }
  });

  if (!cost) {
    throw new NotFoundError(`Cost record with ID ${id} not found`);
  }

  return cost;
}

export async function createCost(data: any) {
  const { buildingId, apartmentId, ...rest } = data;
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

export async function updateCost(id: string, data: any) {
  await getCostById(id);

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

export async function deleteCost(id: string) {
  await getCostById(id);

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
