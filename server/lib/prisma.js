// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Official Prisma Client singleton pattern
// See: https://www.prisma.io/docs/guides/database/troubleshooting-orm/database-connections#prevent-hot-reloading-from-creating-new-instances-of-prismaclient

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
