import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/categoryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true' || searchParams.get('includeInactive') === 'true';

    const categoryService = new CategoryService();
    const categories = await categoryService.getAllCategories(includeAll);

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (err: any) {
    console.error('API GET /api/categories error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Không thể tải danh sách danh mục' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoryService = new CategoryService();
    const category = await categoryService.createCategory(body);

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Tạo danh mục thành công',
    });
  } catch (err: any) {
    console.error('API POST /api/categories error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi tạo danh mục' },
      { status: 400 }
    );
  }
}
