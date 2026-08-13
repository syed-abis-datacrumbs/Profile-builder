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
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options?.folder || 'profile-builder-assets',
          resource_type: 'image',
          use_filename: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(fileBuffer);
  });
}
