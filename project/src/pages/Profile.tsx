import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  MapPin,
  Package,
  Star,
  Edit2,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface OrderSummary {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: number;
}

interface Review {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const Profile = () => {
  const { user, profile, addresses, updateProfile, addAddress, updateAddress, deleteAddress } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || ''
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchReviews();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items (count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data.map(order => ({
        ...order,
        items: order.order_items[0].count
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          products (name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data.map(review => ({
        id: review.id,
        product_name: review.products.name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      })));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editedProfile);
      setIsEditing(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setIsAddingAddress(false);
      setNewAddress({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
      });
      setSaveMessage('Address added successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      setSaveMessage('Address deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'reviews', name: 'Reviews', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          {saveMessage && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
              {saveMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Update your profile information and manage your addresses.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center text-purple-600 hover:text-purple-700"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-5 w-5 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-5 w-5 mr-1" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <dl className="space-y-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                        <dd className="mt-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.full_name}
                              onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-white">{profile?.full_name}</p>
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {new Date(profile?.created_at || '').toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Addresses Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping Addresses</h3>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="flex items-center text-purple-600 hover:text-purple-700"
                      >
                        <Plus className="h-5 w-5 mr-1" />
                        Add Address
                      </button>
                    </div>

                    {isAddingAddress && (
                      <form onSubmit={handleAddAddress} className="mb-6 space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Address Name
                            </label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Home, Office, etc."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              value={newAddress.address_line1}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={newAddress.address_line2}
                            onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              City
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              State/Province
                            </label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={newAddress.postal_code}
                              onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Country
                          </label>
                          <input
                            type="text"
                            value={newAddress.country}
                            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="is_default"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Set as default address
                          </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {address.name}
                              </h4>
                              {address.is_default && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                              <br />
                              {address.city}, {address.state} {address.postal_code}
                              <br />
                              {address.country}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="ml-4 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Order History</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">My Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.product_name}
                            </p>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;