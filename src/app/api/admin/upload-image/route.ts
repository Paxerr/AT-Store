import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  name?: string;
  is_primary?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Collect all files from 'files' or 'file' form fields
    const filesList = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ].filter((f): f is File => f instanceof File && f.size > 0);

    if (filesList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất một file ảnh từ máy tính' },
        { status: 400 }
      );
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

    if (isCloudinaryConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }

    // Prepare uploads directory for local fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create public/uploads folder:', err);
      }
    }

    // Process files concurrently
    const uploadPromises = filesList.map(async (file, idx): Promise<UploadResult> => {
      if (!allowedMime.includes(file.type)) {
        throw new Error(`File "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng JPG, PNG, WebP, GIF, AVIF.`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Try Cloudinary first if configured
      if (isCloudinaryConfigured) {
        try {
          const result: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'anhthu_sneaker/products',
                resource_type: 'image',
                format: 'webp',
                quality: 'auto',
              },
              (error, res) => {
                if (error) reject(error);
                else resolve(res);
              }
            );
            uploadStream.end(buffer);
          });

          return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            name: file.name,
            is_primary: idx === 0,
          };
        } catch (cloudErr: any) {
          console.warn(`[Upload] Cloudinary upload failed for ${file.name}, falling back to local storage:`, cloudErr?.message);
        }
      }

      // Local fallback storage in public/uploads/
      const ext = path.extname(file.name) || '.webp';
      const cleanBaseName = file.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30);
      const filename = `${Date.now()}_${cleanBaseName}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filePath, buffer);

      return {
        url: `/uploads/${filename}`,
        format: ext.replace('.', ''),
        bytes: buffer.length,
        name: file.name,
        is_primary: idx === 0,
      };
    });

    const results = await Promise.allSettled(uploadPromises);
    const uploadedFiles: UploadResult[] = [];
    const errors: string[] = [];

    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        uploadedFiles.push(res.value);
      } else {
        errors.push(`${filesList[i].name}: ${res.reason?.message || 'Lỗi không xác định'}`);
      }
    });

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể tải lên bất kỳ ảnh nào. Lỗi: ${errors.join(', ')}`,
        },
        { status: 500 }
      );
    }

    // Set first image as primary by default
    if (uploadedFiles.length > 0) {
      uploadedFiles[0].is_primary = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles,
        url: uploadedFiles[0]?.url || '', // for backward compatibility with single-file callers
        total_uploaded: uploadedFiles.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      message:
        errors.length > 0
          ? `Đã tải lên ${uploadedFiles.length}/${filesList.length} ảnh (${errors.length} lỗi)`
          : `Đã tải lên ${uploadedFiles.length} ảnh thành công`,
    });
  } catch (err: any) {
    console.error('Lỗi khi tải ảnh lên:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý khi tải ảnh lên' },
      { status: 500 }
    );
  }
}
