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
exports.PrismaLayoutRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaLayoutRepository = class PrismaLayoutRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.layout.findUnique({ where: { id } });
    }
    async findByUserId(userId) {
        return this.prisma.layout.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.layout.create({ data: data });
    }
    async update(id, data) {
        return this.prisma.layout.update({ where: { id }, data: data });
    }
    async delete(id) {
        await this.prisma.layout.delete({ where: { id } });
    }
    async createVersion(layoutId, snapshot) {
        return this.prisma.layoutVersion.create({
            data: { layoutId, snapshot: snapshot },
        });
    }
    async getVersions(layoutId) {
        return this.prisma.layoutVersion.findMany({
            where: { layoutId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PrismaLayoutRepository = PrismaLayoutRepository;
exports.PrismaLayoutRepository = PrismaLayoutRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaLayoutRepository);
//# sourceMappingURL=prisma-layout.repository.js.map