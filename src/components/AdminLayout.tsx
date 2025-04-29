import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  HeadphonesIcon
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    subscribeToMessages();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('unread_count')
        .gt('unread_count', 0);

      if (error) throw error;

      const totalUnread = data?.reduce((sum, ticket) => sum + ticket.unread_count, 0) || 0;
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const subscribeToMessages = () => {
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages'
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  };

  if (!user || !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { 
      name: 'Support', 
      href: '/admin/support', 
      icon: HeadphonesIcon,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { name: 'Forum', href: '/admin/forum', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-purple-600">
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-purple-100 text-purple-600'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t space-y-2">
              <Link
                to="/"
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-purple-50 hover:text-purple-600"
              >
                <Home className="w-5 h-5 mr-3" />
                Return to Site
              </Link>
              <button
                onClick={() => logout()}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-purple-50 hover:text-purple-600"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;