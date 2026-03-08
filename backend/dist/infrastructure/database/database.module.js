"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const prisma_user_repository_1 = require("./prisma-user.repository");
const prisma_layout_repository_1 = require("./prisma-layout.repository");
const prisma_audit_repository_1 = require("./prisma-audit.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
const layout_repository_1 = require("../../domain/repositories/layout.repository");
const audit_repository_1 = require("../../domain/repositories/audit.repository");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            { provide: user_repository_1.USER_REPOSITORY, useClass: prisma_user_repository_1.PrismaUserRepository },
            { provide: layout_repository_1.LAYOUT_REPOSITORY, useClass: prisma_layout_repository_1.PrismaLayoutRepository },
            { provide: audit_repository_1.AUDIT_REPOSITORY, useClass: prisma_audit_repository_1.PrismaAuditRepository },
        ],
        exports: [user_repository_1.USER_REPOSITORY, layout_repository_1.LAYOUT_REPOSITORY, audit_repository_1.AUDIT_REPOSITORY],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map