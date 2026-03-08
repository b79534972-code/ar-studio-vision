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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getCookieOptions() {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
    }
    getBearerToken(req) {
        const authHeader = req.headers?.authorization;
        if (!authHeader || typeof authHeader !== 'string')
            return undefined;
        const [scheme, value] = authHeader.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !value)
            return undefined;
        return value;
    }
    async register(body, res) {
        const { user, token } = await this.authService.register(body.name, body.email, body.password);
        res.cookie('token', token, this.getCookieOptions());
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                createdAt: user.createdAt,
            },
        };
    }
    async login(body, res) {
        const { user, token } = await this.authService.login(body.email, body.password);
        res.cookie('token', token, this.getCookieOptions());
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                createdAt: user.createdAt,
            },
        };
    }
    async me(req) {
        const token = req.cookies?.['token'] || this.getBearerToken(req);
        if (!token)
            throw new common_1.UnauthorizedException('Authentication required');
        const user = await this.authService.validateToken(token);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                createdAt: user.createdAt,
            },
        };
    }
    logout(res) {
        const cookieOptions = this.getCookieOptions();
        res.clearCookie('token', {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
        });
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map