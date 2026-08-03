import prisma from '../prisma';
import { NotFoundError, AuthorizationError } from '../errors';
import { type UserSession, canManageTenant, canViewTenant } from '../auth/policies';

export async function getAllTenants() {
  return prisma.tenant.findMany({
    include: { address: true }
  });
}

export async function getTenantById(id: string, user?: UserSession) {
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

  if (user && !canViewTenant(user, tenant.id)) {
    throw new AuthorizationError('You do not have access to view this tenant');
  }

  return tenant;
}

export async function createTenant(data: any, user?: UserSession) {
  if (user && !canManageTenant(user)) {
    throw new AuthorizationError('Only landlords can manage tenants');
  }

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

export async function updateTenant(id: string, data: any, user?: UserSession) {
  await getTenantById(id, user);

  if (user && !canManageTenant(user)) {
    throw new AuthorizationError('Only landlords can manage tenants');
  }

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

export async function deleteTenant(id: string, user?: UserSession) {
  await getTenantById(id, user);

  if (user && !canManageTenant(user)) {
    throw new AuthorizationError('Only landlords can manage tenants');
  }

  return prisma.tenant.delete({
    where: { id }
  });
}
