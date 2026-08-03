import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllMaintenanceRequests() {
  return prisma.maintenanceRequest.findMany({
    include: {
      tenant: true,
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function getAllMaintenanceRequestsFiltered(role: string, userId: string, tenantId?: string | null) {
  const where = role === 'LANDLORD'
    ? { apartment: { building: { userId } } }
    : { tenantId: tenantId || '' };

  return prisma.maintenanceRequest.findMany({
    where,
    include: {
      apartment: {
        include: {
          building: {
            include: { address: true }
          }
        }
      },
      tenant: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getMaintenanceRequestById(id: string) {
  const request = await prisma.maintenanceRequest.findUnique({
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

  if (!request) {
    throw new NotFoundError(`Maintenance Request with ID ${id} not found`);
  }

  return request;
}

export async function createMaintenanceRequest(data: any) {
  const { tenantId, apartmentId, ...rest } = data;
  return prisma.maintenanceRequest.create({
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

export async function createTenantMaintenanceRequest(tenantId: string, data: any) {
  const activeLease = await prisma.lease.findFirst({
    where: { tenantId }
  });

  if (!activeLease) {
    throw new NotFoundError('No active lease found for this tenant');
  }

  return prisma.maintenanceRequest.create({
    data: {
      title: data.title,
      category: data.category,
      urgency: data.urgency || 'MEDIUM',
      description: data.description,
      status: 'PENDING',
      apartment: { connect: { id: activeLease.apartmentId } },
      tenant: { connect: { id: tenantId } }
    }
  });
}

export async function updateMaintenanceRequest(id: string, data: any) {
  await getMaintenanceRequestById(id);

  const { tenantId, apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (tenantId) {
    payload.tenant = { connect: { id: tenantId } };
  }
  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.maintenanceRequest.update({
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

export async function deleteMaintenanceRequest(id: string) {
  await getMaintenanceRequestById(id);

  return prisma.maintenanceRequest.delete({
    where: { id }
  });
}

export async function getActiveMaintenanceRequestsCount(apartmentIds: string[]) {
  return prisma.maintenanceRequest.count({
    where: {
      apartmentId: { in: apartmentIds },
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    }
  });
}

export async function getUrgentMaintenanceAlerts(apartmentIds: string[], limit: number = 3) {
  return prisma.maintenanceRequest.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      urgency: { in: ['HIGH', 'EMERGENCY'] }
    },
    include: {
      apartment: {
        include: {
          building: {
            include: { address: true }
          }
        }
      },
      tenant: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function getMaintenanceRequestsByTenantId(tenantId: string) {
  return prisma.maintenanceRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}
