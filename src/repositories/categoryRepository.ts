import { ICategoryRepository } from './interfaces';
import { Category } from '@/types/product';
import { DataStore } from './dataStore';
import { GoogleSheetsClient } from './googleSheetsClient';

export class CategoryRepository implements ICategoryRepository {
  private store = DataStore.getInstance();
  private sheetsClient = GoogleSheetsClient.getInstance();

  public async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    const categories = this.store.getCategories();
    const filtered = includeInactive ? categories : categories.filter((c) => c.active);
    return [...filtered].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  public async getCategoryById(id: string): Promise<Category | null> {
    const categories = this.store.getCategories();
    return categories.find((c) => c.category_id === id || c.slug === id) || null;
  }

  public async createCategory(category: Category): Promise<Category> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      
      // Check existing slug
      if (raw.categories.some((c) => c.slug === category.slug)) {
        throw new Error(`Đường dẫn slug "${category.slug}" đã tồn tại. Vui lòng chọn slug khác.`);
      }

      const newCategory: Category = {
        category_id: category.category_id || `cat_${Date.now()}`,
        name: category.name.trim(),
        slug: category.slug.trim(),
        description: category.description?.trim() || '',
        image: category.image?.trim() || '',
        parent_id: category.parent_id || undefined,
        sort_order: Number(category.sort_order) || raw.categories.length + 1,
        active: category.active !== undefined ? category.active : true,
      };

      raw.categories.push(newCategory);

      // Async write to Google Sheets if configured
      if (this.sheetsClient.isReady()) {
        const imgFormula = newCategory.image ? `=IMAGE("${newCategory.image}")` : '';
        this.sheetsClient.appendRow('Categories', [
          newCategory.category_id,
          newCategory.name,
          newCategory.slug,
          newCategory.description,
          newCategory.image,
          imgFormula,
          newCategory.sort_order,
          newCategory.active ? 'Hoạt động' : 'Tạm ẩn',
        ]);
      }

      return newCategory;
    });
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const idx = raw.categories.findIndex((c) => c.category_id === id || c.slug === id);
      if (idx === -1) {
        throw new Error(`Danh mục "${id}" không tồn tại`);
      }

      // Check slug uniqueness if changed
      if (updates.slug && updates.slug !== raw.categories[idx].slug) {
        if (raw.categories.some((c, i) => i !== idx && c.slug === updates.slug)) {
          throw new Error(`Đường dẫn slug "${updates.slug}" đã tồn tại`);
        }
      }

      raw.categories[idx] = {
        ...raw.categories[idx],
        ...updates,
      };

      return raw.categories[idx];
    });
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const target = raw.categories.find((c) => c.category_id === id || c.slug === id);
      if (!target) {
        return { success: false, error: 'Danh mục không tồn tại' };
      }

      // Check if products are assigned to this category
      const assignedProducts = raw.products.filter(
        (p) => p.category_id === target.category_id || p.category_id === target.slug
      );

      if (assignedProducts.length > 0) {
        return {
          success: false,
          error: `Không thể xóa danh mục "${target.name}" vì đang có ${assignedProducts.length} sản phẩm thuộc danh mục này. Vui lòng chuyển sản phẩm sang danh mục khác trước khi xóa.`,
        };
      }

      raw.categories = raw.categories.filter((c) => c.category_id !== target.category_id);
      return { success: true };
    });
  }
}
