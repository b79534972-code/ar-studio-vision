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
exports.PrismaCreditRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaCreditRepository = class PrismaCreditRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActiveBatches(userId) {
        return this.prisma.creditPurchase.findMany({
            where: {
                userId,
                status: 'completed',
                creditsRemaining: { gt: 0 },
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { expiresAt: 'asc' },
        });
    }
    async getAllBatches(userId) {
        return this.prisma.creditPurchase.findMany({
            where: { userId, status: 'completed' },
            orderBy: { purchasedAt: 'desc' },
        });
    }
    async createBatch(data) {
        return this.prisma.creditPurchase.create({
            data: {
                ...data,
                creditsRemaining: data.creditAmount,
                status: 'completed',
            },
        });
    }
    async updateBatch(id, data) {
        return this.prisma.creditPurchase.update({
            where: { id },
            data,
        });
    }
    async atomicConsumeCredits(userId, amount) {
        return this.prisma.$transaction(async (tx) => {
            const batches = await tx.creditPurchase.findMany({
                where: {
                    userId,
                    status: 'completed',
                    creditsRemaining: { gt: 0 },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
                orderBy: { expiresAt: 'asc' },
            });
            const totalRemaining = batches.reduce((sum, b) => sum + b.creditsRemaining, 0);
            if (totalRemaining < amount) {
                return { success: false, totalRemaining };
            }
            let remaining = amount;
            for (const batch of batches) {
                if (remaining <= 0)
                    break;
                const deduct = Math.min(batch.creditsRemaining, remaining);
                await tx.creditPurchase.update({
                    where: { id: batch.id },
                    data: { creditsRemaining: { decrement: deduct } },
                });
                remaining -= deduct;
            }
            return { success: true, totalRemaining: totalRemaining - amount };
        });
    }
    async getTotalRemaining(userId) {
        const result = await this.prisma.creditPurchase.aggregate({
            where: {
                userId,
                status: 'completed',
                creditsRemaining: { gt: 0 },
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            _sum: { creditsRemaining: true },
        });
        return result._sum.creditsRemaining ?? 0;
    }
};
exports.PrismaCreditRepository = PrismaCreditRepository;
exports.PrismaCreditRepository = PrismaCreditRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCreditRepository);
//# sourceMappingURL=prisma-credit.repository.js.map