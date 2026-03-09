"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const redis_config_1 = require("../../common/redis.config");
const ai_job_processor_1 = require("./processors/ai-job.processor");
const conversion_job_processor_1 = require("./processors/conversion-job.processor");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRoot({
                connection: (0, redis_config_1.getRedisConnectionOptions)(),
            }),
            bullmq_1.BullModule.registerQueue({ name: 'ai-processing' }, { name: 'usdz-conversion' }, { name: 'email' }, { name: 'webhook-retry' }),
        ],
        providers: [ai_job_processor_1.AIJobProcessor, conversion_job_processor_1.ConversionJobProcessor],
        exports: [bullmq_1.BullModule],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map