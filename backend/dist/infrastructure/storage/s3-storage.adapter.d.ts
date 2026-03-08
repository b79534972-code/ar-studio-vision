import { IStorageService } from './storage.interface';
export declare class S3StorageAdapter implements IStorageService {
    private s3;
    private bucket;
    constructor();
    getUploadUrl(path: string, contentType: string, expiresInSeconds?: number): Promise<{
        url: string;
        key: string;
    }>;
    getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
    deleteFile(path: string): Promise<void>;
}
