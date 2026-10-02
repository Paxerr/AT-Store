import { IProductRepository } from './interfaces';
import { Product, ProductVariant, Category, Brand, ProductMedia } from '@/types/product';
import { DataStore } from './dataStore';
import { GoogleSheetsClient } from './googleSheetsClient';

export class ProductRepository implements IProductRepository {
  private store = DataStore.getInstance();
  private sheetsClient = GoogleSheetsClient.getInstance();

  public async getAllProducts(): Promise<Product[]> {
    const products = this.store.getProducts();
    const variants = this.store.getVariants();
    const media = this.store.getMedia();
    const categories = this.store.getCategories();
    const brands = this.store.getBrands();

    return products.map((p) => {
      const pVariants = variants.filter((v) => v.product_id === p.product_id);
      const pMedia = media.filter((m) => m.product_id === p.product_id);
      const cat = categories.find((c) => c.category_id === p.category_id);
      const br = brands.find((b) => b.brand_id === p.brand_id);

      const prices = pVariants.map((v) => v.price).filter((pr) => pr > 0);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;

      return {
        ...p,
        variants: pVariants,
        media: pMedia,
        category_name: cat ? cat.name : undefined,
        brand_name: br ? br.name : undefined,
        min_price: minPrice,
        max_price: maxPrice,
        available_sizes: Array.from(new Set(pVariants.map((v) => v.size))),
        available_colors: Array.from(new Set(pVariants.map((v) => v.color))),
      };
    });
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find((p) => p.slug === slug) || null;
  }

  public async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find((p) => p.product_id === id) || null;
  }

  public async createProduct(
    product: Product,
    variants: ProductVariant[],
    media: ProductMedia[]
  ): Promise<Product> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      raw.products.unshift(product);
      raw.variants.push(...variants);
      raw.media.push(...media);

      // Async write to Google Sheets if configured
      if (this.sheetsClient.isReady()) {
        const primaryImg = media.find((m) => m.is_primary || m.type === 'IMAGE')?.url || '';
        const formula = primaryImg ? `=IMAGE("${primaryImg}")` : '';
        const minPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : 0;

        this.sheetsClient.appendRow('Products', [
          product.product_id,
          product.slug,
          product.name,
          product.brand_name || product.brand_id,
          product.category_name || product.category_id,
          minPrice,
          product.status,
          product.featured ? '⭐ Có' : 'Không',
          product.is_new ? 'Có' : 'Không',
          product.is_sale ? 'Có' : 'Không',
          primaryImg,
          formula,
          product.created_at,
        ]);

        // Append media rows to ProductMedia tab
        for (const m of media) {
          const mFormula = m.type === 'IMAGE' && m.url ? `=IMAGE("${m.url}")` : '';
          this.sheetsClient.appendRow('ProductMedia', [
            m.media_id,
            m.product_id,
            product.name,
            m.type,
            m.is_primary ? 'Chính' : 'Phụ',
            m.sort_order || 0,
            m.url,
            mFormula,
          ]);
        }
      }

      return product;
    });
  }

  public async updateProduct(
    id: string,
    updates: Partial<Product> & { variants?: ProductVariant[]; media?: ProductMedia[] }
  ): Promise<Product> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const idx = raw.products.findIndex((p) => p.product_id === id || p.slug === id);
      if (idx === -1) throw new Error(`Product ${id} not found`);

      const targetProductId = raw.products[idx].product_id;

      // Extract variants and media from updates
      const { variants: newVariants, media: newMedia, ...productFields } = updates;

      raw.products[idx] = {
        ...raw.products[idx],
        ...productFields,
        updated_at: new Date().toISOString(),
      };

      // If new variants are supplied, replace them for this product
      if (Array.isArray(newVariants) && newVariants.length > 0) {
        raw.variants = raw.variants.filter((v) => v.product_id !== targetProductId);
        raw.variants.push(
          ...newVariants.map((v, i) => ({
            ...v,
            product_id: targetProductId,
            variant_id: v.variant_id || `var_${targetProductId}_${i + 1}`,
          }))
        );
      }

      // If new media are supplied, replace them for this product
      if (Array.isArray(newMedia)) {
        raw.media = raw.media.filter((m) => m.product_id !== targetProductId);
        raw.media.push(
          ...newMedia.map((m, i) => ({
            ...m,
            product_id: targetProductId,
            media_id: m.media_id || `med_${targetProductId}_${i + 1}`,
          }))
        );
      }

      return raw.products[idx];
    });
  }

  public async deleteProduct(id: string): Promise<boolean> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const target = raw.products.find((p) => p.product_id === id || p.slug === id);
      const targetId = target ? target.product_id : id;
      raw.products = raw.products.filter((p) => p.product_id !== targetId);
      raw.variants = raw.variants.filter((v) => v.product_id !== targetId);
      raw.media = raw.media.filter((m) => m.product_id !== targetId);
      return true;
    });
  }

  public async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    return this.store.getVariants().filter((v) => v.product_id === productId);
  }

  public async getVariantById(variantId: string): Promise<ProductVariant | null> {
    return this.store.getVariants().find((v) => v.variant_id === variantId) || null;
  }

  public async updateVariant(variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const idx = raw.variants.findIndex((v) => v.variant_id === variantId);
      if (idx === -1) throw new Error(`Variant ${variantId} not found`);

      raw.variants[idx] = {
        ...raw.variants[idx],
        ...updates,
      };

      return raw.variants[idx];
    });
  }

  public async getMediaByProductId(productId: string): Promise<ProductMedia[]> {
    return this.store.getMedia().filter((m) => m.product_id === productId);
  }

  public async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    const categories = this.store.getCategories();
    const filtered = includeInactive ? categories : categories.filter((c) => c.active);
    return [...filtered].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  public async getAllBrands(): Promise<Brand[]> {
    return this.store.getBrands().filter((b) => b.active);
  }
}
