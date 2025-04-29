import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Forum from './pages/Forum';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import SignUp from './pages/SignUp';
import Support from './pages/Support';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import AdminSupport from './pages/admin/Support';
import AdminForum from './pages/admin/Forum';
import AdminSettings from './pages/admin/Settings';
import UserSettings from './pages/admin/Settings';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import OrderConfirmation from './pages/OrderConfirmation';
import { useAuthStore, useThemeStore } from './lib/store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Routes>
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="forum" element={<AdminForum />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Protected Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-grow">
                    <UserSettings />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-grow">
                    <Profile />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-grow">
                    <OrderHistory />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-grow">
                    <Forum />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-grow">
                    <Support />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route
            element={
              <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          >
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;