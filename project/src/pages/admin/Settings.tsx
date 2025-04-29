import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save,
  RefreshCw,
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Clock,
  Languages,
  CreditCard
} from 'lucide-react';
import { useContactStore, useCurrencyStore, useThemeStore } from '../../lib/store';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' }
];

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { selectedCurrency, setSelectedCurrency, updateExchangeRates, exchangeRates } = useCurrencyStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [emailNotifications, setEmailNotifications] = useState({
    marketing: true,
    security: true,
    updates: true
  });

  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) {
      updateExchangeRates();
    }
  }, []);

  const handleUpdateRates = async () => {
    setIsUpdatingRates(true);
    await updateExchangeRates();
    setIsUpdatingRates(false);
  };

  const handleSave = () => {
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'currency', name: 'Currency', icon: CreditCard },
    { id: 'language', name: 'Language', icon: Languages }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
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
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        defaultValue="johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        defaultValue="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h2>
                  <div className="space-y-4">
                    {Object.entries(emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {key} Emails
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive {key} related notifications
                          </p>
                        </div>
                        <button
                          onClick={() => setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            value ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              value ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Toggle dark mode theme
                        </p>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isDarkMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Currency Settings */}
              {activeTab === 'currency' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Currency Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Display Currency
                      </label>
                      <div className="mt-1 flex space-x-2">
                        <select
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.name} ({currency.symbol})
                            </option>
                          ))}
                        </select>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleUpdateRates}
                          disabled={isUpdatingRates}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <RefreshCw className={`h-5 w-5 ${isUpdatingRates ? 'animate-spin' : ''}`} />
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Exchange Rates
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          {currencies.map((currency) => (
                            <div key={currency.code} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">{currency.code}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {exchangeRates[currency.code]?.toFixed(4) || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Sample Conversions
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          $100 USD = {currencies.find(c => c.code === selectedCurrency)?.symbol}
                          {(exchangeRates[selectedCurrency] * 100).toFixed(2)} {selectedCurrency}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          {currencies.find(c => c.code === selectedCurrency)?.symbol}100 {selectedCurrency} = $
                          {(100 / exchangeRates[selectedCurrency]).toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Settings */}
              {activeTab === 'language' && (
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Language Settings</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Language
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      defaultValue="en"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                      <option value="ru">Русский</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 rounded-b-lg">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;