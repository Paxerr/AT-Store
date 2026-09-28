import { NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/customerRepository';

export async function GET() {
  try {
    const customerRepo = new CustomerRepository();
    const customers = await customerRepo.getAllCustomers();

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải danh sách khách hàng' },
      { status: 500 }
    );
  }
}
