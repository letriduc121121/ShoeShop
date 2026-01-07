// src/pages/Admin/ProductManagement.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { productsApi } from '../../api/products';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import ProductFormModal from './ProductFormModal';

export default function ProductManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const deleteProduct = useDeleteProduct();

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      deleteProduct.mutate(productId, {
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { message: 'Đã xóa sản phẩm', type: 'success' }
          }));
        },
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Danh sách sản phẩm</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          THÊM SẢN PHẨM
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-heading">ID</th>
                <th className="px-6 py-4 text-left font-heading">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left font-heading">Danh mục</th>
                <th className="px-6 py-4 text-left font-heading">Giá</th>
                <th className="px-6 py-4 text-left font-heading">Size</th>
                <th className="px-6 py-4 text-left font-heading">Tồn kho</th>
                <th className="px-6 py-4 text-left font-heading">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">{product.id}</td>
                  <td className="px-6 py-4 font-semibold">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary text-white text-xs rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">{product.size}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        product={editingProduct}
      />
    </div>
  );
}