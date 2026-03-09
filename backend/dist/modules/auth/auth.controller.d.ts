import { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        name: string;
        email: string;
        password: string;
    }, res: Response): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../domain/entities/user.entity").Role;
            subscriptionPlan: import("../../domain/entities/user.entity").SubscriptionPlan;
            subscriptionStatus: import("../../domain/entities/user.entity").SubscriptionStatus;
            createdAt: Date;
        };
    }>;
    login(body: {
        identifier?: string;
        email?: string;
        password: string;
    }, res: Response): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../domain/entities/user.entity").Role;
            subscriptionPlan: import("../../domain/entities/user.entity").SubscriptionPlan;
            subscriptionStatus: import("../../domain/entities/user.entity").SubscriptionStatus;
            createdAt: Date;
        };
    }>;
    logout(res: Response): {
        success: boolean;
    };
}
