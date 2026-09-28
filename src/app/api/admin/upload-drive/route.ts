import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn một file ảnh từ máy tính' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng ảnh
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng file không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP' },
        { status: 400 }
      );
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || undefined;

    if (!email || !rawKey) {
      return NextResponse.json(
        { success: false, error: 'Chưa cấu hình tài khoản dịch vụ Google trong .env.local' },
        { status: 500 }
      );
    }

    const privateKey = rawKey.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Đổi tên file để tránh trùng lặp
    const cleanFileName = `ATS_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // 1. Tải file lên Google Drive
    const fileMetadata: any = {
      name: cleanFileName,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = uploadResponse.data.id;
    if (!fileId) {
      throw new Error('Google Drive không trả về ID file sau khi tải lên');
    }

    // 2. Cấp quyền xem công khai cho file ảnh (anyone with the link can view)
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr: any) {
      console.warn('[UploadDrive] Không thể cấp quyền public riêng lẻ (có thể thư mục cha đã được chia sẻ):', permErr.message);
    }

    // 3. Tạo link CDN trực tiếp của Google
    const directCdnUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        fileName: cleanFileName,
        url: directCdnUrl,
        driveViewLink: uploadResponse.data.webViewLink,
      },
      message: 'Tải ảnh lên Google Drive thành công',
    });
  } catch (err: any) {
    console.error('API /api/admin/upload-drive error:', err);
    let errorMessage = err.message || 'Lỗi khi tải ảnh lên Google Drive';
    if (err.message && err.message.includes('has not been used in project')) {
      errorMessage = 'Google Drive API chưa được bật trên Google Cloud Console. Hãy vào Google Cloud để bật Google Drive API.';
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
