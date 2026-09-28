import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const productService = new ProductService();
    let product = await productService.getProductBySlug(slug);

    if (!product) {
      product = await productService.getProductById(slug);
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (err: any) {
    console.error('API /api/products/[slug] error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống khi tải sản phẩm' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const productService = new ProductService();
    const updated = await productService.updateProduct(slug, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật sản phẩm thành công',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi cập nhật sản phẩm' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const productService = new ProductService();
    await productService.deleteProduct(slug);

    return NextResponse.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi xóa sản phẩm' },
      { status: 400 }
    );
  }
}
