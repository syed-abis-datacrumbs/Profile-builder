import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const client = new PrismaClient();

  // Auto-retry on Neon cold-start (P1001: Can't reach database) — same
  // retry LMS's own client uses against this database.
  client.$use(async (params, next) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await next(params);
      } catch (err: any) {
        const isNeonColdStart =
          err?.message?.includes("Can't reach database") ||
          err?.code === 'P1001';
        if (isNeonColdStart && i < maxRetries - 1) {
          await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
          continue;
        }
        throw err;
      }
    }
  });

  return client;
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
