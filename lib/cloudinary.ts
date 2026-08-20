import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options?: { folder?: string }
): Promise<{ url: string; publicId: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('[Cloudinary] Missing credentials, skipping remote upload.');
    return { url: '', publicId: '' };
  }

  return new Promise((resolve) => {
    try {
      cloudinary.uploader
        .upload_stream(
          {
            folder: options?.folder || 'profile-builder-assets',
            resource_type: 'image',
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              console.error('[Cloudinary] Upload error:', error);
              resolve({ url: '', publicId: '' });
            } else {
              resolve({ url: result.secure_url, publicId: result.public_id });
            }
          }
        )
        .end(fileBuffer);
    } catch (err) {
      console.error('[Cloudinary] Exception during upload stream:', err);
      resolve({ url: '', publicId: '' });
    }
  });
}
