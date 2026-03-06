/**
 * StorageService Interface — Cloud Storage Abstraction
 * Concrete adapter injected via DI.
 */

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface IStorageService {
  /**
   * Generate a pre-signed upload URL. File never touches server memory.
   */
  getUploadUrl(path: string, contentType: string, expiresInSeconds?: number): Promise<{ url: string; key: string }>;

  /**
   * Generate a pre-signed download URL
   */
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Delete a file
   */
  deleteFile(path: string): Promise<void>;
}
