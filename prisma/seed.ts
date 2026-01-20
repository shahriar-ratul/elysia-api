import { PrismaClient } from '@/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// Import seed data
import { permissionSeeds } from './seedData/permission';
import { roleSeeds } from './seedData/role';
import { adminSeeds } from './seedData/admin';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Truncate tables in correct order (delete child tables before parent tables)
  console.log('🗑️  Truncating tables...');
  await prisma.adminRole.deleteMany();
  await prisma.adminPermission.deleteMany();
  await prisma.permissionRole.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  console.log('✅ Truncated tables');

  // Seed permissions
  console.log('🌱 Seeding permissions...');
  for (const permission of permissionSeeds) {
    await prisma.permission.create({
      data: {
        name: permission.name,
        displayName: permission.displayName,
        slug: permission.slug,
        group: permission.group,
        groupOrder: permission.groupOrder,
        order: permission.order,
      },
    });
  }
  console.log('✅ Seeding permissions done');

  // Seed roles
  console.log('🌱 Seeding roles...');
  for (const [index, role] of roleSeeds.entries()) {
    const order = index + 1;

    const createdRole = await prisma.role.create({
      data: {
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        order: order,
      },
    });

    // Assign permissions to roles
    if (role.slug === 'superadmin' || role.slug === 'admin') {
      // Super admin and admin get all permissions
      const permissions = await prisma.permission.findMany();
      for (const permission of permissions) {
        await prisma.permissionRole.create({
          data: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    } else {
      // Other roles get limited permissions
      const permissions = await prisma.permission.findMany({
        where: {
          slug: {
            notIn: [
              'admin.view',
              'admin.create',
              'admin.update',
              'admin.delete',
              'admin.status',
              'role.view',
              'role.create',
              'role.update',
              'role.delete',
              'role.status',
              'permission.view',
              'permission.create',
              'permission.update',
              'permission.delete',
            ],
          },
        },
      });

      for (const permission of permissions) {
        await prisma.permissionRole.create({
          data: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }
  console.log('✅ Seeding roles done');

  // Seed admins
  console.log('🌱 Seeding admins...');
  for (const admin of adminSeeds) {
    const hashedPassword = await bcrypt.hash('password', 15);

    const createdAdmin = await prisma.admin.create({
      data: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        dob: new Date('1990-01-01'),
        phone: admin.phone,
        username: admin.username,
        email: admin.email,
        password: hashedPassword,
        gender: admin.gender,
        joinedDate: new Date(),
        isActive: admin.isActive,
        isVerified: admin.isVerified,
        verifiedAt: new Date(),
        verifiedByEmail: admin.verifiedByEmail,
        verifiedByPhone: admin.verifiedByPhone,
      },
    });

    // Assign roles to admins
    let roleSlug = 'user';
    if (createdAdmin.username === 'super_admin') {
      roleSlug = 'superadmin';
    } else if (createdAdmin.username === 'admin') {
      roleSlug = 'admin';
    } else if (createdAdmin.username === 'editor') {
      roleSlug = 'editor';
    }

    const role = await prisma.role.findFirst({
      where: { slug: roleSlug },
    });

    if (role) {
      await prisma.adminRole.create({
        data: {
          adminId: createdAdmin.id,
          roleId: role.id,
        },
      });
    }
  }
  console.log('✅ Seeding admins done');

  // Seed additional random admins
  console.log('🌱 Seeding additional admins...');
  const userRole = await prisma.role.findFirst({
    where: { slug: 'user' },
  });

  if (userRole) {
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await bcrypt.hash('password', 15);

      const admin = await prisma.admin.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          dob: faker.date.birthdate(),
          gender: 'male',
          phone: faker.phone.number(),
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: hashedPassword,
          joinedDate: new Date(),
          isActive: true,
          isVerified: true,
          verifiedAt: new Date(),
          verifiedByEmail: true,
          verifiedByPhone: true,
        },
      });

      await prisma.adminRole.create({
        data: {
          adminId: admin.id,
          roleId: userRole.id,
        },
      });
    }
  }
  console.log('✅ Seeding additional admins done');

  // make 10 users
  console.log('🌱 Seeding users...');

  // user@user.com
  // password
  // user
  // 1234567890

  const hashedPassword = await bcrypt.hash('password', 15);
  await prisma.user.create({
    data: {
      email: `user@user.com`,
      password: hashedPassword,
      username: 'user',
      phone: '1234567890',
      firstName: 'User',
      lastName: 'User',
      joinedDate: new Date(),
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedByEmail: true,
      verifiedByPhone: true,
      isDeleted: false,
    },
  });

  for (let i = 0; i < 10; i++) {
    const hashedPassword = await bcrypt.hash('password', 15);

    await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dob: faker.date.birthdate(),
        gender: 'male',
        phone: faker.phone.number(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        joinedDate: new Date(),
        isActive: true,
        isVerified: true,
        verifiedAt: new Date(),
        verifiedByEmail: true,
        verifiedByPhone: true,
      },
    });
  }

  console.log('✅ Seeding users done');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
