"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConversionJobProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionJobProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let ConversionJobProcessor = ConversionJobProcessor_1 = class ConversionJobProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(ConversionJobProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Converting model ${job.data.modelId} to USDZ`);
        return { usdzUrl: `https://cdn.example.com/models/${job.data.modelId}.usdz` };
    }
};
exports.ConversionJobProcessor = ConversionJobProcessor;
exports.ConversionJobProcessor = ConversionJobProcessor = ConversionJobProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('usdz-conversion')
], ConversionJobProcessor);
//# sourceMappingURL=conversion-job.processor.js.map