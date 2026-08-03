import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageMeter, canViewMeter } from '../auth/policies';

export async function getAllMeters() {
  return prisma.meter.findMany({
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function getMeterById(id: string, user?: UserSession) {
  const meter = await prisma.meter.findUnique({
    where: { id },
    include: {
      building: true,
      apartment: {
        include: { building: true }
      }
    }
  });

  if (!meter) {
    throw new NotFoundError(`Meter record with ID ${id} not found`);
  }

  if (user) {
    const buildingOwnerId = meter.building?.userId || meter.apartment?.building?.userId || '';
    if (!canViewMeter(user, buildingOwnerId)) {
      throw new AuthorizationError('You do not have access to view this meter');
    }
  }

  return meter;
}

export async function createMeter(data: any, user?: UserSession) {
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

  if (user && !canManageMeter(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage meters for this property');
  }

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

export async function updateMeter(id: string, data: any, user?: UserSession) {
  const existing = await getMeterById(id, user);

  const buildingOwnerId = existing.building?.userId || existing.apartment?.building?.userId || '';
  if (user && !canManageMeter(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage this meter');
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

  return prisma.meter.update({
    where: { id },
    data: payload,
    include: {
      building: true,
      apartment: true
    }
  });
}

export async function deleteMeter(id: string, user?: UserSession) {
  const existing = await getMeterById(id, user);

  const buildingOwnerId = existing.building?.userId || existing.apartment?.building?.userId || '';
  if (user && !canManageMeter(user, buildingOwnerId)) {
    throw new AuthorizationError('You do not have permission to manage this meter');
  }

  return prisma.meter.delete({
    where: { id }
  });
}
