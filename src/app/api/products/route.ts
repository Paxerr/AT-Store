import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const search = searchParams.get('search') || undefined;
    const size = searchParams.get('size') || undefined;
    const color = searchParams.get('color') || undefined;
    const is_sale = searchParams.get('is_sale') === 'true' ? true : undefined;
    const has_3d = searchParams.get('has_3d') === 'true' ? true : undefined;
    const sort = (searchParams.get('sort') as any) || undefined;

    const minPriceStr = searchParams.get('min_price');
    const maxPriceStr = searchParams.get('max_price');
    const minPrice = minPriceStr ? parseInt(minPriceStr, 10) : undefined;
    const maxPrice = maxPriceStr ? parseInt(maxPriceStr, 10) : undefined;

    const productService = new ProductService();
    const products = await productService.getAllProducts({
      category,
      brand,
      search,
      size,
      color,
      is_sale,
      has_3d,
      sort,
      minPrice,
      maxPrice,
    });

    const categories = await productService.getAllCategories();
    const brands = await productService.getAllBrands();

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        brands,
        total: products.length,
      },
    });
  } catch (err: any) {
    console.error('API /api/products error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Không thể tải danh sách sản phẩm' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productService = new ProductService();
    const product = await productService.createProduct(body);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Tạo sản phẩm thành công',
    });
  } catch (err: any) {
    console.error('API POST /api/products error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi tạo sản phẩm' },
      { status: 400 }
    );
  }
}
