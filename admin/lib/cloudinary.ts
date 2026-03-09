import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'vertex-labs',
  options: Record<string, unknown> = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No upload result'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format || '',
          sizeBytes: result.bytes || 0,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
