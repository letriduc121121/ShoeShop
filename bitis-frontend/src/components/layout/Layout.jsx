// src/components/layout/Layout.jsx
import Navbar from './Navbar';
import Toast from '../common/Toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Toast />
    </div>
  );
}