export declare const STORAGE_SERVICE: unique symbol;
export interface IStorageService {
    getUploadUrl(path: string, contentType: string, expiresInSeconds?: number): Promise<{
        url: string;
        key: string;
    }>;
    getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
    deleteFile(path: string): Promise<void>;
}
