import { createClerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@datacrumbs.org';
  try {
    const users = await clerk.users.getUserList({ emailAddress: [email] });
    if (users.data.length === 0) {
      console.log('User not found in Clerk:', email);
      return;
    }
    const userId = users.data[0].id;
    console.log('Found user ID:', userId);

    const updated = await prisma.resumeProfile.upsert({
      where: { userId },
      create: { userId, fullNameEditsUsed: 4 },
      update: { fullNameEditsUsed: 4 },
    });
    console.log('Updated profile builder lock to 4 edits (locked):', updated);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
