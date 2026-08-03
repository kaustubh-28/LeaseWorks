import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllApartments() {
  return prisma.apartment.findMany({
    include: {
      building: {
        include: { address: true }
      }
    }
  });
}

export async function getApartmentById(id: string) {
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

  return apartment;
}

export async function createApartment(data: any) {
  const { buildingId, ...rest } = data;
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

export async function updateApartment(id: string, data: any) {
  // Check if exists
  await getApartmentById(id);

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

export async function deleteApartment(id: string) {
  // Check if exists
  await getApartmentById(id);

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
