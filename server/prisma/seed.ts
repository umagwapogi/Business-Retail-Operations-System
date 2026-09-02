import { PrismaClient, UserRole, SubscriptionTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create a business
  const business = await prisma.business.create({
    data: {
      name: 'Demo Retail Store',
      owner_id: 'admin-uuid',
      subscription_tier: SubscriptionTier.PREMIUM,
    },
  });

  console.log('Created business:', business.name);

  // Create a location
  const location = await prisma.location.create({
    data: {
      name: 'Main Street Store',
      address: '123 Main Street, City, State 12345',
      phone: '+1-555-0123',
      business_id: business.id,
    },
  });

  console.log('Created location:', location.name);

  // Create users with different roles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@retailops.com',
      password_hash: passwordHash,
      role: UserRole.ADMIN,
      business_id: business.id,
      location_id: location.id,
    },
  });

  console.log('Created admin user:', admin.email);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@retailops.com',
      password_hash: passwordHash,
      role: UserRole.MANAGER,
      business_id: business.id,
      location_id: location.id,
    },
  });

  console.log('Created manager user:', manager.email);

  const staff = await prisma.user.create({
    data: {
      email: 'staff@retailops.com',
      password_hash: passwordHash,
      role: UserRole.STAFF,
      business_id: business.id,
      location_id: location.id,
    },
  });

  console.log('Created staff user:', staff.email);

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password_hash: passwordHash,
      role: UserRole.CUSTOMER,
      location_id: location.id,
      points_balance: 100,
    },
  });

  console.log('Created customer user:', customer.email);

  // Create sample rewards
  const reward1 = await prisma.reward.create({
    data: {
      name: 'Free Coffee',
      description: 'Get a free coffee of your choice',
      points_required: 50,
      stock_quantity: 100,
      is_active: true,
    },
  });

  console.log('Created reward:', reward1.name);

  const reward2 = await prisma.reward.create({
    data: {
      name: '10% Off Next Purchase',
      description: 'Get 10% discount on your next purchase',
      points_required: 100,
      stock_quantity: 50,
      is_active: true,
    },
  });

  console.log('Created reward:', reward2.name);

  const reward3 = await prisma.reward.create({
    data: {
      name: 'Free T-Shirt',
      description: 'Get a branded t-shirt',
      points_required: 500,
      stock_quantity: 20,
      is_active: true,
    },
  });

  console.log('Created reward:', reward3.name);

  // Create sample transactions
  const transaction1 = await prisma.transaction.create({
    data: {
      user_id: customer.id,
      staff_id: staff.id,
      location_id: location.id,
      type: 'PURCHASE',
      amount: 25.50,
      points_change: 25,
      description: 'Store purchase',
    },
  });

  console.log('Created transaction:', transaction1.id);

  const transaction2 = await prisma.transaction.create({
    data: {
      user_id: customer.id,
      staff_id: staff.id,
      location_id: location.id,
      type: 'PURCHASE',
      amount: 50.00,
      points_change: 50,
      description: 'Store purchase',
    },
  });

  console.log('Created transaction:', transaction2.id);

  // Create audit log
  await prisma.auditLog.create({
    data: {
      user_id: admin.id,
      action: 'SYSTEM_INIT',
      entity_type: 'SYSTEM',
      details: 'Database seeded with initial data',
    },
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
