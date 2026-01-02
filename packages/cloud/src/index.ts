import { v2 as cloudinary } from 'cloudinary';
export interface CloudClientOptions {
  secure_distribution?: string;
  upload_prefix?: string;
  secure?: boolean;
  upload_preset?: string;
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export type CloudClientInstance = typeof cloudinary;

export const createCloudClient = (
  opts: CloudClientOptions,
): CloudClientInstance => {
  cloudinary.config({
    ...opts,
  });
  return cloudinary;
};
