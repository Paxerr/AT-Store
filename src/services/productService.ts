import { ProductRepository } from '@/repositories/productRepository';
import { Product, ProductVariant, ProductMedia } from '@/types/product';
import { productInputSchema } from '@/schemas/productSchema';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  public async getAllProducts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    is_sale?: boolean;
    has_3d?: boolean;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'featured';
  }): Promise<Product[]> {
    let products = await this.productRepo.getAllProducts();

    if (!filters) return products;

    if (filters.category) {
      products = products.filter(
        (p) =>
          p.category_id === filters.category ||
          p.category_name?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    if (filters.brand) {
      products = products.filter(
        (p) =>
          p.brand_id === filters.brand ||
          p.brand_name?.toLowerCase() === filters.brand?.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.variants?.some((v) => v.sku.toLowerCase().includes(q) || v.barcode.includes(q))
      );
    }

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => (p.min_price || 0) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => (p.min_price || 0) <= filters.maxPrice!);
    }

    if (filters.size) {
      products = products.filter((p) => p.available_sizes?.includes(filters.size!));
    }

    if (filters.color) {
      products = products.filter((p) => p.available_colors?.includes(filters.color!));
    }

    if (filters.is_sale) {
      products = products.filter((p) => p.is_sale);
    }

    if (filters.has_3d) {
      products = products.filter((p) => p.has_3d_model);
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          products.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
          break;
        case 'price-desc':
          products.sort((a, b) => (b.min_price || 0) - (a.min_price || 0));
          break;
        case 'name-asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
          products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        case 'newest':
        default:
          products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    }

    return products;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    return this.productRepo.getProductBySlug(slug);
  }

  public async getProductById(id: string): Promise<Product | null> {
    return this.productRepo.getProductById(id);
  }

  public async createProduct(payload: any): Promise<Product> {
    const validated = productInputSchema.parse(payload);
    const productId = `prod_${Date.now()}`;

    const variants: ProductVariant[] = validated.variants.map((v, idx) => ({
      variant_id: v.variant_id || `var_${productId}_${idx + 1}`,
      product_id: productId,
      sku: v.sku,
      barcode: v.barcode || '',
      size: v.size || 'Tiêu chuẩn',
      color: v.color || 'Tiêu chuẩn',
      price: v.price,
      compare_at_price: v.compare_at_price || 0,
      cost_price: v.cost_price || 0,
      stock: v.stock,
      reserved_stock: 0,
      weight: v.weight || 500,
      status: 'ACTIVE',
      image: v.image || '',
      options: v.options,
    }));

    const media: ProductMedia[] = validated.media.map((m, idx) => ({
      media_id: `med_${productId}_${idx + 1}`,
      product_id: productId,
      type: m.type,
      url: m.url,
      thumbnail: m.thumbnail || '',
      alt: m.alt || validated.name,
      sort_order: m.sort_order || idx + 1,
      is_primary: m.is_primary || idx === 0,
    }));

    const product: Product = {
      product_id: productId,
      slug: validated.slug,
      name: validated.name,
      description: validated.description || '',
      short_description: validated.short_description || '',
      brand_id: validated.brand_id,
      category_id: validated.category_id,
      status: validated.status,
      featured: validated.featured,
      is_new: validated.is_new,
      is_sale: validated.is_sale,
      has_3d_model: validated.has_3d_model,
      seo_title: validated.seo_title || validated.name,
      seo_description: validated.seo_description || validated.short_description,
      options: validated.options || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.productRepo.createProduct(product, variants, media);
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return this.productRepo.updateProduct(id, updates);
  }

  public async deleteProduct(id: string): Promise<boolean> {
    return this.productRepo.deleteProduct(id);
  }

  public async getAllCategories() {
    return this.productRepo.getAllCategories();
  }

  public async getAllBrands() {
    return this.productRepo.getAllBrands();
  }
}
