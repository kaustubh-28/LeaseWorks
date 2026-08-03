import prisma from '../prisma';
import { NotFoundError } from '../errors';

export async function getAllPayments() {
  return prisma.payment.findMany({
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function getPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      apartment: {
        include: {
          building: {
            include: { address: true }
          }
        }
      }
    }
  });

  if (!payment) {
    throw new NotFoundError(`Payment with ID ${id} not found`);
  }

  return payment;
}

export async function createPayment(data: any) {
  const { apartmentId, ...rest } = data;
  return prisma.payment.create({
    data: {
      ...rest,
      apartment: { connect: { id: apartmentId } }
    },
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function updatePayment(id: string, data: any) {
  await getPaymentById(id);

  const { apartmentId, ...rest } = data;
  const payload: any = { ...rest };

  if (apartmentId) {
    payload.apartment = { connect: { id: apartmentId } };
  }

  return prisma.payment.update({
    where: { id },
    data: payload,
    include: {
      apartment: {
        include: { building: true }
      }
    }
  });
}

export async function deletePayment(id: string) {
  await getPaymentById(id);

  return prisma.payment.delete({
    where: { id }
  });
}

export async function getTotalIncomingPayments(apartmentIds: string[]) {
  const paidPayments = await prisma.payment.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      status: 'paid'
    },
    select: { amount: true }
  });
  return paidPayments.reduce((sum, p) => sum + p.amount, 0);
}

export async function getPaymentsByApartmentId(apartmentId: string) {
  return prisma.payment.findMany({
    where: { apartmentId },
    orderBy: { dueDate: 'desc' }
  });
}
