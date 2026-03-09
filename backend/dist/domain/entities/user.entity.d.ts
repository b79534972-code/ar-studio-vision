export type Role = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'basic' | 'advanced' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export interface UserEntity {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    role: Role;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserUsageEntity {
    userId: string;
    modelsCount: number;
    layoutsCount: number;
    aiRequestsCount: number;
    arSessionsCount: number;
    updatedAt: Date;
}
export interface LayoutEntity {
    id: string;
    userId: string;
    name: string;
    roomId: string;
    version: number;
    objects: Record<string, unknown>[];
    createdAt: Date;
    updatedAt: Date;
}
export interface LayoutVersionEntity {
    id: string;
    layoutId: string;
    version: number;
    snapshot: Record<string, unknown>;
    createdAt: Date;
}
export interface AuditLogEntity {
    id: string;
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
