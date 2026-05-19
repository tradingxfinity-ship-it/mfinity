import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    configured = true;
  }
}

export { cloudinary };

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder: string;
    resourceType?: "image" | "raw" | "auto";
    publicId?: string;
    allowedFormats?: string[];
  }
): Promise<{ publicId: string; url: string; secureUrl: string }> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? "image",
        public_id: options.publicId,
        allowed_formats: options.allowedFormats ?? ["jpg", "jpeg", "png", "pdf", "webp"],
        max_bytes: 10 * 1024 * 1024,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}

export function getSignedUrl(publicId: string, expiresInSeconds = 3600): string {
  ensureConfigured();
  return cloudinary.url(publicId, {
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    secure: true,
  });
}
