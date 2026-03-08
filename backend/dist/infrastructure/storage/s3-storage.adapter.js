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
exports.S3StorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3StorageAdapter = class S3StorageAdapter {
    constructor() {
        this.bucket = process.env.S3_BUCKET || 'interior-ar-assets';
        this.s3 = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'ap-southeast-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }
    async getUploadUrl(path, contentType, expiresInSeconds = 3600) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: path,
            ContentType: contentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: expiresInSeconds });
        return { url, key: path };
    }
    async getSignedUrl(path, expiresInSeconds = 3600) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: path });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: expiresInSeconds });
    }
    async deleteFile(path) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: path }));
    }
};
exports.S3StorageAdapter = S3StorageAdapter;
exports.S3StorageAdapter = S3StorageAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3StorageAdapter);
//# sourceMappingURL=s3-storage.adapter.js.map