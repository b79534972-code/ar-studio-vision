import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class AIJobProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job): Promise<any>;
    private generateLayout;
    private realisticRender;
}
