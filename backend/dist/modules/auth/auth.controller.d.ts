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
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../domain/entities/user.entity").Role;
            subscriptionPlan: import("../../domain/entities/user.entity").SubscriptionPlan;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../domain/entities/user.entity").Role;
            subscriptionPlan: import("../../domain/entities/user.entity").SubscriptionPlan;
        };
    }>;
    logout(res: Response): {
        success: boolean;
    };
}
