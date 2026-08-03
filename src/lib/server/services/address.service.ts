import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllAddresses() {
  return prisma.address.findMany();
}

export async function getAddressById(id: string) {
  const address = await prisma.address.findUnique({
    where: { id },
    include: { buildings: true }
  });
  if (!address) {
    throw new NotFoundError(`Address with ID ${id} not found`);
  }
  return address;
}

export async function createAddress(data: any) {
  return prisma.address.create({
    data
  });
}

export async function updateAddress(id: string, data: any) {
  // Check if exists
  await getAddressById(id);

  return prisma.address.update({
    where: { id },
    data
  });
}

export async function deleteAddress(id: string) {
  // Check if exists
  await getAddressById(id);

  return prisma.address.delete({
    where: { id }
  });
}
