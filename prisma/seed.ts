import prisma from '$lib/server/prisma';
import bcrypt from 'bcrypt';

async function clearDatabase() {
    console.log('🌱 Clearing existing data...');
    await prisma.$transaction([
        prisma.maintenanceRequest.deleteMany(),
        prisma.lease.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.tenant.deleteMany(),
        prisma.cost.deleteMany(),
        prisma.meter.deleteMany(),
        prisma.apartment.deleteMany(),
        prisma.building.deleteMany(),
        prisma.user.deleteMany(),
        prisma.address.deleteMany()
    ]);
}

async function seed() {
    console.log('🌱 Seeding fresh data...');

    // Create Addresses
    const address1 = await prisma.address.create({
        data: {
            street: 'Sunset Blvd',
            houseNumber: '123',
            city: 'Los Angeles',
            postalCode: '90210',
            state: 'California',
            country: 'USA'
        }
    });

    const address2 = await prisma.address.create({
        data: {
            street: 'Modern St',
            houseNumber: '456',
            city: 'San Francisco',
            postalCode: '94105',
            state: 'California',
            country: 'USA'
        }
    });

    const address3 = await prisma.address.create({
        data: {
            street: 'Tenant Ave',
            houseNumber: '789',
            city: 'New York',
            postalCode: '10001',
            state: 'New York',
            country: 'USA'
        }
    });

    // Create Landlord Users
    const user1Password = await bcrypt.hash('password1', 10);
    const user1 = await prisma.user.create({
        data: {
            email: 'user123@example.com',
            password: user1Password,
            name: 'User One',
            role: 'LANDLORD',
            addressId: address3.id
        }
    });

    const user2Password = await bcrypt.hash('password2', 10);
    const user2 = await prisma.user.create({
        data: {
            email: 'user210@example.com',
            password: user2Password,
            name: 'User Two',
            role: 'LANDLORD',
            addressId: address3.id
        }
    });

    // Create Buildings
    const building1 = await prisma.building.create({
        data: {
            name: 'Sunset Villa',
            addressId: address1.id,
            userId: user1.id,
            floors: 2
        }
    });

    const building2 = await prisma.building.create({
        data: {
            name: 'Modern Loft',
            addressId: address2.id,
            userId: user2.id,
            floors: 1
        }
    });

    // Create Apartments
    const apartment1 = await prisma.apartment.create({
        data: {
            name: 'Apartment 1A',
            buildingId: building1.id,
            floor: 0,
            type: 'APARTMENT',
            size: 50,
            sizeUnit: 'SQM'
        }
    });

    const apartment2 = await prisma.apartment.create({
        data: {
            name: 'Apartment 2A',
            buildingId: building1.id,
            floor: 1,
            type: 'APARTMENT',
            size: 75,
            sizeUnit: 'SQM'
        }
    });

    const apartment3 = await prisma.apartment.create({
        data: {
            name: 'Apartment 2B',
            buildingId: building1.id,
            floor: 1,
            type: 'APARTMENT',
            size: 80,
            sizeUnit: 'SQM'
        }
    });

    const apartment4 = await prisma.apartment.create({
        data: {
            name: 'Apartment 2A',
            buildingId: building2.id,
            floor: 0,
            type: 'APARTMENT',
            size: 60,
            sizeUnit: 'SQM'
        }
    });

    // Create Meters
    const meter1 = await prisma.meter.create({
        data: {
            type: 'Water',
            unit: 'm3',
            costPerUnit: 2.5,
            buildingId: building1.id
        }
    });

    const meter2 = await prisma.meter.create({
        data: {
            type: 'Electricity',
            unit: 'kWh',
            costPerUnit: 0.15,
            buildingId: building2.id
        }
    });

    // Create Costs
    const cost1 = await prisma.cost.create({
        data: {
            name: 'Maintenance',
            amount: 100.0,
            currency: 'USD',
            type: 'SERVICE_CHARGE',
            interval: 'MONTHLY',
            biller: 'Maintenance Company',
            occurredAt: new Date(),
            buildingId: building1.id
        }
    });

    const cost2 = await prisma.cost.create({
        data: {
            name: 'Security',
            amount: 150.0,
            currency: 'EUR',
            type: 'SERVICE_CHARGE',
            interval: 'YEARLY',
            biller: 'Security Company',
            occurredAt: new Date(),
            buildingId: building2.id
        }
    });

    // Create Tenants
    const tenant1 = await prisma.tenant.create({
        data: {
            firstName: 'John',
            name: 'Tenant One',
            email: 'tenant111@example.com',
            phoneNumber: '123-456-7890',
            addressId: address1.id
        }
    });

    const tenant2 = await prisma.tenant.create({
        data: {
            firstName: 'Jane',
            name: 'Tenant Two',
            email: 'tenant210@example.com',
            phoneNumber: '098-765-4321',
            addressId: address2.id
        }
    });

    // Create Tenant Users Linked to Tenant Profiles
    const tenantUser1Password = await bcrypt.hash('password1', 10);
    const tenantUser1 = await prisma.user.create({
        data: {
            email: 'tenant111@example.com',
            password: tenantUser1Password,
            name: 'John Tenant',
            role: 'TENANT',
            tenantId: tenant1.id,
            addressId: address3.id
        }
    });

    const tenantUser2Password = await bcrypt.hash('password2', 10);
    const tenantUser2 = await prisma.user.create({
        data: {
            email: 'tenant210@example.com',
            password: tenantUser2Password,
            name: 'Jane Tenant',
            role: 'TENANT',
            tenantId: tenant2.id,
            addressId: address3.id
        }
    });

    // Create Payments
    const payment1 = await prisma.payment.create({
        data: {
            amount: 1200.0,
            currency: 'USD',
            dueDate: new Date('2026-08-01'),
            status: 'pending',
            type: 'REGULAR_RENT',
            apartmentId: apartment1.id
        }
    });

    const payment2 = await prisma.payment.create({
        data: {
            amount: 1500.0,
            currency: 'USD',
            dueDate: new Date('2026-08-01'),
            status: 'paid',
            type: 'REGULAR_RENT',
            apartmentId: apartment2.id
        }
    });

    const payment3 = await prisma.payment.create({
        data: {
            amount: 200.0,
            currency: 'USD',
            dueDate: new Date('2026-09-01'),
            status: 'pending',
            type: 'ADDITIONAL_PAYMENT',
            apartmentId: apartment1.id
        }
    });

    // Create Leases
    const lease1 = await prisma.lease.create({
        data: {
            startDate: new Date('2026-01-01'),
            rentAmount: 1200.0,
            currency: 'USD',
            apartmentId: apartment1.id,
            tenantId: tenant1.id
        }
    });

    const lease2 = await prisma.lease.create({
        data: {
            startDate: new Date('2026-02-01'),
            rentAmount: 1500.0,
            currency: 'USD',
            apartmentId: apartment2.id,
            tenantId: tenant2.id
        }
    });

    // Create Maintenance Requests
    const req1 = await prisma.maintenanceRequest.create({
        data: {
            title: 'Water leak in master bathroom',
            category: 'plumbing',
            urgency: 'HIGH',
            description: 'There is a steady leak coming from under the sink. The floor is getting wet.',
            status: 'PENDING',
            apartmentId: apartment1.id,
            tenantId: tenant1.id
        }
    });

    const req2 = await prisma.maintenanceRequest.create({
        data: {
            title: 'HVAC making loud noise',
            category: 'hvac',
            urgency: 'MEDIUM',
            description: 'The air conditioning unit makes a loud rattling noise when it starts up.',
            status: 'RESOLVED',
            apartmentId: apartment2.id,
            tenantId: tenant2.id
        }
    });

    const req3 = await prisma.maintenanceRequest.create({
        data: {
            title: 'Kitchen sink draining slowly',
            category: 'plumbing',
            urgency: 'LOW',
            description: 'The kitchen sink takes a long time to drain completely.',
            status: 'RESOLVED',
            apartmentId: apartment1.id,
            tenantId: tenant1.id
        }
    });
}

async function main() {
    await clearDatabase();
    await seed();
    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });