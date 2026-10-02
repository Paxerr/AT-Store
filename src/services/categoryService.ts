import { CategoryRepository } from '@/repositories/categoryRepository';
import { ProductRepository } from '@/repositories/productRepository';
import { Category } from '@/types/product';
import { categoryInputSchema } from '@/schemas/productSchema';

export interface CategoryWithStats extends Category {
  product_count: number;
}

export class CategoryService {
  private categoryRepo: CategoryRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.productRepo = new ProductRepository();
  }

  public async getAllCategories(includeInactive: boolean = false): Promise<CategoryWithStats[]> {
    const categories = await this.categoryRepo.getAllCategories(includeInactive);
    const products = await this.productRepo.getAllProducts();

    return categories.map((cat) => {
      const count = products.filter(
        (p) => p.category_id === cat.category_id || p.category_id === cat.slug
      ).length;
      return {
        ...cat,
        product_count: count,
      };
    });
  }

  public async getCategoryById(id: string): Promise<CategoryWithStats | null> {
    const category = await this.categoryRepo.getCategoryById(id);
    if (!category) return null;

    const products = await this.productRepo.getAllProducts();
    const count = products.filter(
      (p) => p.category_id === category.category_id || p.category_id === category.slug
    ).length;

    return {
      ...category,
      product_count: count,
    };
  }

  public async createCategory(payload: any): Promise<Category> {
    const validated = categoryInputSchema.parse(payload);

    const category: Category = {
      category_id: `cat_${Date.now()}`,
      name: validated.name.trim(),
      slug: validated.slug.trim(),
      description: validated.description?.trim() || '',
      image: validated.image?.trim() || '',
      parent_id: validated.parent_id,
      sort_order: validated.sort_order || 1,
      active: validated.active !== undefined ? validated.active : true,
    };

    return this.categoryRepo.createCategory(category);
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return this.categoryRepo.updateCategory(id, updates);
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    return this.categoryRepo.deleteCategory(id);
  }
}
