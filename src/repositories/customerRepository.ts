import { ICustomerRepository } from './interfaces';
import { Customer } from '@/types/customer';
import { DataStore } from './dataStore';

export class CustomerRepository implements ICustomerRepository {
  private store = DataStore.getInstance();

  public async getCustomerByPhone(phone: string): Promise<Customer | null> {
    const clean = phone.trim().replace(/^(\+84)/, '0');
    const cust = this.store.getCustomers().find((c) => c.phone.replace(/^(\+84)/, '0') === clean);
    return cust || null;
  }

  public async getAllCustomers(): Promise<Customer[]> {
    return this.store.getCustomers();
  }

  public async createOrUpdateCustomer(customerData: Partial<Customer>): Promise<Customer> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const phone = customerData.phone ? customerData.phone.trim().replace(/^(\+84)/, '0') : '';
      const existingIdx = raw.customers.findIndex((c) => c.phone.replace(/^(\+84)/, '0') === phone);

      const now = new Date().toISOString();

      if (existingIdx !== -1) {
        const existing = raw.customers[existingIdx];
        const updated: Customer = {
          ...existing,
          ...customerData,
          total_orders: (existing.total_orders || 0) + (customerData.total_orders ? 1 : 0),
          total_spent: (existing.total_spent || 0) + (customerData.total_spent || 0),
          last_order_at: now,
          updated_at: now,
        };
        raw.customers[existingIdx] = updated;
        return updated;
      } else {
        const newCust: Customer = {
          customer_id: customerData.customer_id || `cust_${Date.now()}`,
          name: customerData.name || 'Khách hàng',
          phone: phone,
          email: customerData.email || '',
          address: customerData.address || '',
          city: customerData.city || '',
          district: customerData.district || '',
          ward: customerData.ward || '',
          notes: customerData.notes || '',
          total_orders: 1,
          total_spent: customerData.total_spent || 0,
          last_order_at: now,
          created_at: now,
          updated_at: now,
        };
        raw.customers.push(newCust);
        return newCust;
      }
    });
  }
}
