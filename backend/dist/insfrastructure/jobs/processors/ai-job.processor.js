"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AIJobProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIJobProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let AIJobProcessor = AIJobProcessor_1 = class AIJobProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(AIJobProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing AI job ${job.id}: ${job.name}`);
        switch (job.name) {
            case 'generate-layout':
                return this.generateLayout(job.data);
            case 'realistic-render':
                return this.realisticRender(job.data);
            default:
                this.logger.warn(`Unknown job: ${job.name}`);
        }
    }
    async generateLayout(data) {
        return { layouts: [{ name: 'Generated Layout', objects: [] }] };
    }
    async realisticRender(data) {
        return { renderUrl: `https://cdn.example.com/renders/${data.layoutId}.jpg` };
    }
};
exports.AIJobProcessor = AIJobProcessor;
exports.AIJobProcessor = AIJobProcessor = AIJobProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('ai-processing')
], AIJobProcessor);
//# sourceMappingURL=ai-job.processor.js.map