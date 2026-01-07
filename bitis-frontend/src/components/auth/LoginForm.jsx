// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // ✅ Import
import useAuthStore from '../../store/authStore';

export default function LoginForm({ onSuccess }) {
  const queryClient = useQueryClient(); // ✅ Get queryClient
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData, queryClient); // ✅ Pass queryClient
      onSuccess?.();
      
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Đăng nhập thành công!', type: 'success' }
      }));
    } catch (err) {
      // Error already handled in store
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2">
          Tên đăng nhập
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          placeholder="Nhập tên đăng nhập"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          placeholder="Nhập mật khẩu"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
      </button>
    </form>
  );
}