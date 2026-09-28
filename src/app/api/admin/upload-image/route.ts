import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Chưa cấu hình Cloudinary! Vui lòng mở file .env.local và điền CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
        },
        { status: 400 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn một file ảnh từ máy tính' },
        { status: 400 }
      );
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng file không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using upload_stream
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'anhthu_sneaker/products',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto',
        },
        (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      message: 'Tải ảnh lên Cloudinary thành công',
    });
  } catch (err: any) {
    console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý khi tải ảnh lên Cloudinary' },
      { status: 500 }
    );
  }
}
