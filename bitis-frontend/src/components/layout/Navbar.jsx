// Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Shield, MessageCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query'; // ✅ Import
import useAuthStore from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import { useUnreadCount } from '../../hooks/useChat';
import AuthModal from '../auth/AuthModal';

export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ Get queryClient
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { data: cartItems } = useCart();
  const { data: unreadCount } = useUnreadCount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchParams.get('login') === 'required' && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [searchParams, isAuthenticated]);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await logout(queryClient); // ✅ Pass queryClient
    setShowUserMenu(false);
    navigate('/');
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Đã đăng xuất', type: 'success' }
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-900 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded transform rotate-45"></div>
              </div>
              <span className="font-heading text-2xl font-bold tracking-wider">
                BITI'S HUNTER
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="font-heading font-semibold hover:text-primary transition-colors"
              >
                TRANG CHỦ
              </Link>
              <Link
                to="/products"
                className="font-heading font-semibold hover:text-primary transition-colors"
              >
                SẢN PHẨM
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className="font-heading font-semibold hover:text-primary transition-colors"
                  >
                    ĐƠN HÀNG
                  </Link>
                  <Link
                    to="/chat"
                    className="font-heading font-semibold hover:text-primary transition-colors relative"
                  >
                    CHAT
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 font-heading font-semibold text-primary hover:text-red-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-64 px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Chat Icon (Mobile) */}
              {isAuthenticated && (
                <Link
                  to="/chat"
                  className="md:hidden relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    isAuthenticated ? setShowUserMenu(!showUserMenu) : setShowAuthModal(true)
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-6 h-6" />
                </button>

                {showUserMenu && isAuthenticated && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border-2 border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <p className="font-semibold">{user?.fullName}</p>
                      <p className="text-sm text-gray-600">{user?.username}</p>
                      {user?.role === 'ADMIN' && (
                        <span className="inline-block mt-1 px-2 py-1 bg-primary text-white text-xs rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>Chat hỗ trợ</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 hover:bg-gray-50 transition-colors text-primary font-semibold"
                      >
                        Quản trị Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </>
  );
}