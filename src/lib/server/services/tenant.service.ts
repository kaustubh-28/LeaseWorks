import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllTenants() {
  return prisma.tenant.findMany({
    include: { address: true }
  });
}

export async function getTenantById(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      address: true,
      leases: {
        include: {
          apartment: {
            include: {
              building: {
                include: { address: true }
              }
            }
          }
        }
      },
      maintenanceRequests: true
    }
  });

  if (!tenant) {
    throw new NotFoundError(`Tenant with ID ${id} not found`);
  }

  return tenant;
}

export async function createTenant(data: any) {
  const { addressId, ...rest } = data;
  const payload: any = { ...rest };

  if (addressId) {
    payload.address = { connect: { id: addressId } };
  }

  return prisma.tenant.create({
    data: payload,
    include: { address: true }
  });
}

export async function updateTenant(id: string, data: any) {
  await getTenantById(id);

  const { addressId, ...rest } = data;
  const payload: any = { ...rest };

  if (addressId) {
    payload.address = { connect: { id: addressId } };
  } else {
    payload.address = { disconnect: true };
  }

  return prisma.tenant.update({
    where: { id },
    data: payload,
    include: { address: true }
  });
}

export async function deleteTenant(id: string) {
  await getTenantById(id);

  return prisma.tenant.delete({
    where: { id }
  });
}
