"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
var client_1 = require("@prisma/client");
var prisma;
if (process.env.NODE_ENV === "production") {
    prisma = new client_1.PrismaClient();
}
else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = new client_1.PrismaClient();
    }
    prisma = global.cachedPrisma;
}
exports.connection = prisma;
