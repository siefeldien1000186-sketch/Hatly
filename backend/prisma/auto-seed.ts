import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database empty, seeding default Hatly Egyptian data...');
      // Execute seed directly
      await import('./seed');
    } else {
      console.log(`✅ Database ready with ${userCount} users. Skipping seed.`);
    }
  } catch (err) {
    console.warn('Auto-seed check notice (continuing):', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();
