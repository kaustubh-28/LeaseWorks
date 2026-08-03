export interface UserSession {
  id: string;
  role: any;
  tenantId?: string | null;
}

/**
 * 1. Building Policies
 */
export function canManageBuilding(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

export function canViewBuilding(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

/**
 * 2. Apartment Policies
 */
export function canManageApartment(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

export function canViewApartment(user: UserSession, buildingOwnerId: string, activeTenantId?: string | null): boolean {
  if (user.role === 'LANDLORD') {
    return user.id === buildingOwnerId;
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && activeTenantId && user.tenantId === activeTenantId);
  }
  return false;
}

/**
 * 3. Tenant Profile Policies
 */
export function canManageTenant(user: UserSession): boolean {
  return user.role === 'LANDLORD';
}

export function canViewTenant(user: UserSession, tenantId: string): boolean {
  if (user.role === 'LANDLORD') {
    return true; // Landlords can search/view tenant profiles
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && user.tenantId === tenantId);
  }
  return false;
}

/**
 * 4. Lease Policies
 */
export function canManageLease(user: UserSession): boolean {
  return user.role === 'LANDLORD';
}

export function canViewLease(user: UserSession, buildingOwnerId: string, tenantId: string): boolean {
  if (user.role === 'LANDLORD') {
    return user.id === buildingOwnerId;
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && user.tenantId === tenantId);
  }
  return false;
}

/**
 * 5. Payment Policies
 */
export function canManagePayment(user: UserSession): boolean {
  return user.role === 'LANDLORD';
}

export function canViewPayment(user: UserSession, buildingOwnerId: string, tenantId?: string | null): boolean {
  if (user.role === 'LANDLORD') {
    return user.id === buildingOwnerId;
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && tenantId && user.tenantId === tenantId);
  }
  return false;
}

/**
 * 6. Maintenance Request Policies
 */
export function canManageMaintenanceRequest(user: UserSession, buildingOwnerId: string, tenantId: string): boolean {
  if (user.role === 'LANDLORD') {
    return user.id === buildingOwnerId;
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && user.tenantId === tenantId);
  }
  return false;
}

export function canViewMaintenanceRequest(user: UserSession, buildingOwnerId: string, tenantId: string): boolean {
  if (user.role === 'LANDLORD') {
    return user.id === buildingOwnerId;
  }
  if (user.role === 'TENANT') {
    return !!(user.tenantId && user.tenantId === tenantId);
  }
  return false;
}

/**
 * 7. Cost Policies
 */
export function canManageCost(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

export function canViewCost(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

/**
 * 8. Meter Policies
 */
export function canManageMeter(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}

export function canViewMeter(user: UserSession, buildingOwnerId: string): boolean {
  return user.role === 'LANDLORD' && user.id === buildingOwnerId;
}
