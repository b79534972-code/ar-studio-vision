"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaUserRepository = class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findByLoginIdentifier(identifier) {
        const trimmed = identifier.trim();
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: trimmed, mode: 'insensitive' } },
                    { name: { equals: trimmed, mode: 'insensitive' } },
                ],
            },
        });
    }
    async findByStripeCustomerId(customerId) {
        return this.prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    }
    async create(data) {
        return this.prisma.user.create({ data });
    }
    async update(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
    async getUsage(userId) {
        return this.prisma.userUsage.findUnique({ where: { userId } });
    }
    async createUsage(userId) {
        return this.prisma.userUsage.create({ data: { userId } });
    }
    async incrementUsage(userId, field) {
        return this.prisma.userUsage.update({
            where: { userId },
            data: { [field]: { increment: 1 } },
        });
    }
    async decrementUsage(userId, field) {
        return this.prisma.userUsage.update({
            where: { userId },
            data: { [field]: { decrement: 1 } },
        });
    }
    async atomicAIIncrement(userId, maxAllowed) {
        return this.prisma.$transaction(async (tx) => {
            const usage = await tx.userUsage.findUnique({ where: { userId } });
            if (!usage)
                throw new Error('Usage record not found');
            if (maxAllowed !== null && usage.aiRequestsCount >= maxAllowed) {
                return { allowed: false, current: usage.aiRequestsCount };
            }
            const updated = await tx.userUsage.update({
                where: { userId },
                data: { aiRequestsCount: { increment: 1 } },
            });
            return { allowed: true, current: updated.aiRequestsCount };
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map