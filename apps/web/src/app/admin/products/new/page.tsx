"use client";

import { ProductForm } from "@/components/admin/products/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">상품 등록</h1>
      <ProductForm />
    </div>
  );
}
