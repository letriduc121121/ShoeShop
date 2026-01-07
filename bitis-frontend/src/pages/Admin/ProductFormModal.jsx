// src/pages/Admin/ProductFormModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';

export default function ProductFormModal({ isOpen, onClose, product = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'NAM',
    size: '',
    stock: '',
    imageUrl: '',
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'NAM',
        size: product.size || '',
        stock: product.stock || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'NAM',
        size: '',
        stock: '',
        imageUrl: '',
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    if (product) {
      // Update
      updateProduct.mutate(
        { id: product.id, data },
        {
          onSuccess: () => {
            window.dispatchEvent(new CustomEvent('app:toast', {
              detail: { message: 'Đã cập nhật sản phẩm', type: 'success' }
            }));
            onClose();
          },
        }
      );
    } else {
      // Create
      createProduct.mutate(data, {
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { message: 'Đã thêm sản phẩm mới', type: 'success' }
          }));
          onClose();
        },
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-heading font-bold mb-6">
            {product ? 'SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Giá *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Danh mục *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="NAM">NAM</option>
                  <option value="NỮ">NỮ</option>
                  <option value="UNISEX">UNISEX</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Size *
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  placeholder="VD: 39, 40, 41"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tồn kho *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                URL hình ảnh
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={createProduct.isLoading || updateProduct.isLoading}
              className="w-full py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300"
            >
              {createProduct.isLoading || updateProduct.isLoading
                ? 'ĐANG XỬ LÝ...'
                : product
                ? 'CẬP NHẬT'
                : 'THÊM MỚI'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}