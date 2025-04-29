import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, Truck, ArrowRight, MapPin } from 'lucide-react';
import { useCartStore, useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from './AuthModal';

interface CheckoutFormData {
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export const Cart = () => {
  const { items, isCartOpen, toggleCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user, profile, addresses, addAddress } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  });
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    name: profile?.full_name || '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 0 ? 9.99 : 0;
  const grandTotal = total + shipping;

  const handleQuantityChange = useCallback((id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQuantity = item.quantity + delta;
      updateQuantity(id, newQuantity);
    }
  }, [items, updateQuantity]);

  const handleRemoveItem = useCallback((id: number) => {
    removeItem(id);
  }, [removeItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckingOut(true);
    setCheckoutStep(0);
  };

  const handleBackToCart = () => {
    setIsCheckingOut(false);
    setCheckoutStep(0);
    setIsAddingAddress(false);
  };

  const handleNextStep = () => {
    setCheckoutStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCheckoutStep(prev => prev - 1);
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
        is_default: false,
      });
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would typically:
      // 1. Validate the form data
      // 2. Process the payment
      // 3. Create the order in your database
      // 4. Send confirmation email
      
      // For now, we'll simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear the cart
      clearCart();
      
      // Navigate to order confirmation
      navigate('/order-confirmation');
      
      // Close the cart
      toggleCart();
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            {!profile?.full_name && (
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-gray-100"
                disabled
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            
            {!isAddingAddress ? (
              <>
                {addresses.length > 0 && (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                          <div>
                            <p className="font-medium">{address.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.country}
                            </p>
                            {address.is_default && (
                              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Default Address
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </button>
              </>
            ) : (
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAddress.name}
                    onChange={handleNewAddressChange}
                    placeholder="Home, Office, etc."
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={newAddress.address_line1}
                    onChange={handleNewAddressChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={newAddress.address_line2}
                    onChange={handleNewAddressChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleNewAddressChange}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleNewAddressChange}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={newAddress.postal_code}
                      onChange={handleNewAddressChange}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={newAddress.country}
                      onChange={handleNewAddressChange}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={newAddress.is_default}
                    onChange={handleNewAddressChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input
                  type="text"
                  name="cardCvc"
                  value={formData.cardCvc}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex items-center">
                {isCheckingOut ? (
                  <button onClick={handleBackToCart} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                ) : (
                  <ShoppingBag className="h-6 w-6 text-gray-600 dark:text-gray-300 mr-2" />
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isCheckingOut ? 'Checkout' : 'Shopping Cart'}
                </h2>
              </div>
              {!isCheckingOut && (
                <button
                  onClick={toggleCart}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>

            {isCheckingOut ? (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-8">
                    {['Contact', 'Shipping', 'Payment'].map((step, index) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index <= checkoutStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm mt-1">{step}</span>
                        </div>
                        {index < 2 && (
                          <div className={`flex-1 h-1 mx-2 ${
                            index < checkoutStep ? 'bg-blue-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {renderCheckoutStep()}
                </div>

                <div className="border-t dark:border-gray-700 p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {checkoutStep > 0 && (
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
                      >
                        Back
                      </button>
                    )}
                    {checkoutStep < 2 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        disabled={checkoutStep === 1 && !selectedAddressId && !isAddingAddress}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        Place Order
                      </button>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">${item.price.toFixed(2)}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item.id, -1);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-gray-900 dark:text-white min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item.id, 1);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t dark:border-gray-700 p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    disabled={items.length === 0}
                    onClick={startCheckout}
                    className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath={null}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsCheckingOut(true);
          setCheckoutStep(0);
        }}
      />
    </AnimatePresence>
  );
};