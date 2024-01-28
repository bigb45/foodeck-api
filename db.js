import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line no-var, no-unused-vars
var cachedPrisma;

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const connection = prisma;
