import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/categoryService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const categoryService = new CategoryService();
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (err: any) {
    console.error(`API GET /api/categories/${params.id} error:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const categoryService = new CategoryService();
    const updated = await categoryService.updateCategory(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật danh mục thành công',
    });
  } catch (err: any) {
    console.error(`API PATCH /api/categories/${params.id} error:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi cập nhật danh mục' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const categoryService = new CategoryService();
    const result = await categoryService.deleteCategory(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Không thể xóa danh mục' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa danh mục thành công',
    });
  } catch (err: any) {
    console.error(`API DELETE /api/categories/${params.id} error:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi xóa danh mục' },
      { status: 400 }
    );
  }
}
