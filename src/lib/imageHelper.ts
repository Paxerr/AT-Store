/**
 * ANH THƯ SNEAKER — Image Helper Utilities
 * Hỗ trợ tự động chuyển đổi mọi định dạng link chia sẻ của Google Drive sang link ảnh CDN trực tiếp.
 */

export function formatImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Dạng link chia sẻ: https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // 2. Dạng link mở: https://drive.google.com/open?id={FILE_ID} hoặc uc?id={FILE_ID}
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // 3. Nếu là link trực tiếp hoặc CDN khác (Unsplash, Cloudinary...), giữ nguyên
  return trimmed;
}

export function isGoogleDriveUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('googleusercontent.com');
}
