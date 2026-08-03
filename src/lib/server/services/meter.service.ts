import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllMeters() {
  return prisma.meter.findMany({
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function getMeterById(id: string) {
  const meter = await prisma.meter.findUnique({
    where: { id },
    include: {
      building: true,
      apartment: true
    }
  });

  if (!meter) {
    throw new NotFoundError(`Meter record with ID ${id} not found`);
  }

  return meter;
}

export async function createMeter(data: any) {
  const { buildingId, apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (buildingId) {
    payload.building = { connect: { id: buildingId } };
  }
  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.meter.create({
    data: payload,
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function updateMeter(id: string, data: any) {
  await getMeterById(id);

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

  return prisma.meter.update({
    where: { id },
    data: payload,
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function deleteMeter(id: string) {
  await getMeterById(id);

  return prisma.meter.delete({
    where: { id }
  });
}
