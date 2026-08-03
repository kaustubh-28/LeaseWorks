import { ValidationError } from '../errors';

// Helper to check for email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to check for valid date
function isValidDate(dateStr: any): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function validateAddress(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.street || String(data.street).trim() === '') errors.street = 'Street is required';
  if (!data.houseNumber || String(data.houseNumber).trim() === '') errors.houseNumber = 'House number is required';
  if (!data.city || String(data.city).trim() === '') errors.city = 'City is required';
  if (!data.postalCode || String(data.postalCode).trim() === '') errors.postalCode = 'Postal code is required';
  if (!data.country || String(data.country).trim() === '') errors.country = 'Country is required';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    street: String(data.street).trim(),
    houseNumber: String(data.houseNumber).trim(),
    city: String(data.city).trim(),
    postalCode: String(data.postalCode).trim(),
    state: data.state ? String(data.state).trim() : null,
    country: String(data.country).trim(),
  };
}

export function validateBuilding(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.name || String(data.name).trim() === '') errors.name = 'Building name is required';
  if (!data.addressId || String(data.addressId).trim() === '') errors.addressId = 'Address is required';
  if (!data.userId || String(data.userId).trim() === '') errors.userId = 'Landlord User is required';
  if (data.floors === undefined || data.floors === '' || isNaN(Number(data.floors))) {
    errors.floors = 'Floors must be a valid number';
  } else if (Number(data.floors) < 0) {
    errors.floors = 'Floors cannot be negative';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    name: String(data.name).trim(),
    addressId: String(data.addressId),
    userId: String(data.userId),
    floors: Number(data.floors),
  };
}

export function validateApartment(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.name || String(data.name).trim() === '') errors.name = 'Apartment name is required';
  if (!data.buildingId || String(data.buildingId).trim() === '') errors.buildingId = 'Building is required';
  
  if (data.size === undefined || data.size === '' || isNaN(Number(data.size))) {
    errors.size = 'Size must be a valid number';
  } else if (Number(data.size) <= 0) {
    errors.size = 'Size must be greater than zero';
  }

  const validUnits = ['SQM', 'SQFT'];
  if (!data.sizeUnit || !validUnits.includes(data.sizeUnit)) {
    errors.sizeUnit = `Size unit must be one of: ${validUnits.join(', ')}`;
  }

  if (data.floor === undefined || data.floor === '' || isNaN(Number(data.floor))) {
    errors.floor = 'Floor must be a valid number';
  }

  const validTypes = ['HOUSE', 'APARTMENT', 'STUDIO', 'LOFT', 'DUPLEX', 'PENTHOUSE'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = `Type must be one of: ${validTypes.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    name: String(data.name).trim(),
    buildingId: String(data.buildingId),
    size: Number(data.size),
    sizeUnit: data.sizeUnit,
    floor: Number(data.floor),
    type: data.type,
  };
}

export function validateTenant(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.firstName || String(data.firstName).trim() === '') errors.firstName = 'First name is required';
  if (!data.name || String(data.name).trim() === '') errors.name = 'Last name is required';
  
  if (!data.email || String(data.email).trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(String(data.email).trim())) {
    errors.email = 'Invalid email address format';
  }
  
  if (!data.phoneNumber || String(data.phoneNumber).trim() === '') errors.phoneNumber = 'Phone number is required';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    firstName: String(data.firstName).trim(),
    name: String(data.name).trim(),
    email: String(data.email).trim().toLowerCase(),
    phoneNumber: String(data.phoneNumber).trim(),
    addressId: data.addressId ? String(data.addressId) : null,
  };
}

export function validateLease(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.startDate || !isValidDate(data.startDate)) {
    errors.startDate = 'Start date must be a valid date';
  }
  
  if (data.endDate && !isValidDate(data.endDate)) {
    errors.endDate = 'End date must be a valid date';
  }

  if (data.rentAmount === undefined || data.rentAmount === '' || isNaN(Number(data.rentAmount))) {
    errors.rentAmount = 'Rent amount must be a number';
  } else if (Number(data.rentAmount) <= 0) {
    errors.rentAmount = 'Rent amount must be greater than zero';
  }

  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!data.currency || !validCurrencies.includes(data.currency)) {
    errors.currency = `Currency must be one of: ${validCurrencies.join(', ')}`;
  }

  if (!data.apartmentId || String(data.apartmentId).trim() === '') errors.apartmentId = 'Apartment is required';
  if (!data.tenantId || String(data.tenantId).trim() === '') errors.tenantId = 'Tenant is required';

  // Compare dates if both are valid
  if (data.startDate && data.endDate && isValidDate(data.startDate) && isValidDate(data.endDate)) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      errors.endDate = 'End date cannot be before start date';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
    rentAmount: Number(data.rentAmount),
    currency: data.currency,
    apartmentId: String(data.apartmentId),
    tenantId: String(data.tenantId),
  };
}

export function validatePayment(data: any): any {
  const errors: Record<string, string> = {};

  if (data.amount === undefined || data.amount === '' || isNaN(Number(data.amount))) {
    errors.amount = 'Amount must be a number';
  } else if (Number(data.amount) < 0) {
    errors.amount = 'Amount cannot be negative';
  }

  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!data.currency || !validCurrencies.includes(data.currency)) {
    errors.currency = `Currency must be one of: ${validCurrencies.join(', ')}`;
  }

  if (!data.dueDate || !isValidDate(data.dueDate)) {
    errors.dueDate = 'Due date must be a valid date';
  }

  const validStatuses = ['paid', 'pending', 'overdue'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  const validTypes = ['REGULAR_RENT', 'ADDITIONAL_PAYMENT', 'SERVICE_CHARGE', 'OTHER'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = `Type must be one of: ${validTypes.join(', ')}`;
  }

  if (!data.apartmentId || String(data.apartmentId).trim() === '') errors.apartmentId = 'Apartment is required';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    amount: Number(data.amount),
    currency: data.currency,
    dueDate: new Date(data.dueDate),
    status: data.status,
    type: data.type,
    apartmentId: String(data.apartmentId),
  };
}

export function validateMaintenanceRequest(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.title || String(data.title).trim() === '') errors.title = 'Title is required';
  if (!data.category || String(data.category).trim() === '') errors.category = 'Category is required';
  
  const validUrgencies = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];
  if (!data.urgency || !validUrgencies.includes(data.urgency)) {
    errors.urgency = `Urgency must be one of: ${validUrgencies.join(', ')}`;
  }

  if (!data.description || String(data.description).trim() === '') errors.description = 'Description is required';
  
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (!data.apartmentId || String(data.apartmentId).trim() === '') errors.apartmentId = 'Apartment is required';
  if (!data.tenantId || String(data.tenantId).trim() === '') errors.tenantId = 'Tenant is required';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    title: String(data.title).trim(),
    category: String(data.category).trim(),
    urgency: data.urgency,
    description: String(data.description).trim(),
    status: data.status,
    apartmentId: String(data.apartmentId),
    tenantId: String(data.tenantId),
  };
}

export function validateCost(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.name || String(data.name).trim() === '') errors.name = 'Cost name is required';
  
  if (data.amount === undefined || data.amount === '' || isNaN(Number(data.amount))) {
    errors.amount = 'Amount must be a number';
  } else if (Number(data.amount) <= 0) {
    errors.amount = 'Amount must be greater than zero';
  }

  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!data.currency || !validCurrencies.includes(data.currency)) {
    errors.currency = `Currency must be one of: ${validCurrencies.join(', ')}`;
  }

  const validTypes = ['SERVICE_CHARGE', 'BASE_RENT', 'OTHER'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = `Type must be one of: ${validTypes.join(', ')}`;
  }

  const validIntervals = ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
  if (!data.interval || !validIntervals.includes(data.interval)) {
    errors.interval = `Interval must be one of: ${validIntervals.join(', ')}`;
  }

  if (!data.biller || String(data.biller).trim() === '') errors.biller = 'Biller is required';
  if (!data.occurredAt || !isValidDate(data.occurredAt)) {
    errors.occurredAt = 'Date occurred must be a valid date';
  }

  // Mutual exclusion: either buildingId or apartmentId must be set
  const hasBuilding = data.buildingId && String(data.buildingId).trim() !== '';
  const hasApartment = data.apartmentId && String(data.apartmentId).trim() !== '';
  if (!hasBuilding && !hasApartment) {
    errors.buildingId = 'Either building or apartment must be selected';
    errors.apartmentId = 'Either building or apartment must be selected';
  } else if (hasBuilding && hasApartment) {
    errors.buildingId = 'Cannot assign cost to both building and apartment';
    errors.apartmentId = 'Cannot assign cost to both building and apartment';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    name: String(data.name).trim(),
    amount: Number(data.amount),
    currency: data.currency,
    type: data.type,
    interval: data.interval,
    biller: String(data.biller).trim(),
    occurredAt: new Date(data.occurredAt),
    buildingId: hasBuilding ? String(data.buildingId) : null,
    apartmentId: hasApartment ? String(data.apartmentId) : null,
  };
}

export function validateMeter(data: any): any {
  const errors: Record<string, string> = {};

  if (!data.type || String(data.type).trim() === '') errors.type = 'Meter type is required';
  if (!data.unit || String(data.unit).trim() === '') errors.unit = 'Unit is required';

  if (data.value !== undefined && data.value !== '' && data.value !== null) {
    if (isNaN(Number(data.value))) {
      errors.value = 'Value must be a number';
    }
  }

  if (data.costPerUnit === undefined || data.costPerUnit === '' || isNaN(Number(data.costPerUnit))) {
    errors.costPerUnit = 'Cost per unit must be a number';
  } else if (Number(data.costPerUnit) < 0) {
    errors.costPerUnit = 'Cost per unit cannot be negative';
  }

  // Mutual exclusion: either buildingId or apartmentId must be set
  const hasBuilding = data.buildingId && String(data.buildingId).trim() !== '';
  const hasApartment = data.apartmentId && String(data.apartmentId).trim() !== '';
  if (!hasBuilding && !hasApartment) {
    errors.buildingId = 'Either building or apartment must be selected';
    errors.apartmentId = 'Either building or apartment must be selected';
  } else if (hasBuilding && hasApartment) {
    errors.buildingId = 'Cannot assign meter to both building and apartment';
    errors.apartmentId = 'Cannot assign meter to both building and apartment';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    type: String(data.type).trim(),
    value: (data.value !== undefined && data.value !== '' && data.value !== null) ? Number(data.value) : null,
    unit: String(data.unit).trim(),
    costPerUnit: Number(data.costPerUnit),
    buildingId: hasBuilding ? String(data.buildingId) : null,
    apartmentId: hasApartment ? String(data.apartmentId) : null,
  };
}
