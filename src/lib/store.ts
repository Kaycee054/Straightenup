import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import currency from 'currency.js';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
}

interface Profile {
  id: string;
  full_name: string;
}

interface ShippingAddress {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

interface AuthState {
  token: string | null;
  user: User | null;
  profile: Profile | null;
  addresses: ShippingAddress[];
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  fetchAddresses: () => Promise<void>;
}

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface ContactState {
  contactInfo: ContactInfo;
  officeLocations: OfficeLocation[];
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  addOfficeLocation: (location: Omit<OfficeLocation, 'id'>) => void;
  removeOfficeLocation: (id: string) => void;
  updateOfficeLocation: (id: string, location: Partial<OfficeLocation>) => void;
}

interface CurrencyState {
  selectedCurrency: string;
  exchangeRates: Record<string, number>;
  setSelectedCurrency: (currency: string) => void;
  updateExchangeRates: () => Promise<void>;
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      profile: null,
      addresses: [],
      signup: async (email: string, password: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) throw signUpError;

        if (!authData.user) throw new Error('No user data returned');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: authData.user.id }])
          .select()
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        const user = {
          id: authData.user.id,
          email: authData.user.email!,
          role: (authData.user.app_metadata.role as 'admin' | 'manager' | 'user') || 'user',
          name: profileData?.full_name || authData.user.email!.split('@')[0],
        };

        set({ 
          token: authData.session?.access_token || null,
          user,
          profile: profileData || { id: user.id, full_name: user.name }
        });

        await get().fetchAddresses();
      },
      login: async (email: string, password: string) => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        const user = {
          id: authData.user.id,
          email: authData.user.email!,
          role: (authData.user.app_metadata.role as 'admin' | 'manager' | 'user') || 'user',
          name: profileData?.full_name || authData.user.email!.split('@')[0],
        };

        set({ 
          token: authData.session?.access_token || null,
          user,
          profile: profileData || { id: user.id, full_name: user.name }
        });

        await get().fetchAddresses();
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ token: null, user: null, profile: null, addresses: [] });
        window.location.href = '/';
      },
      updateProfile: async (data) => {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: get().user?.id, ...data });

        if (error) throw error;

        set((state) => ({
          profile: { ...state.profile!, ...data },
          user: state.user ? { ...state.user, name: data.full_name || state.user.name } : null,
        }));
      },
      addAddress: async (address) => {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .insert([{ ...address, user_id: get().user?.id }])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          addresses: [...state.addresses, data],
        }));
      },
      updateAddress: async (id, address) => {
        const { error } = await supabase
          .from('shipping_addresses')
          .update(address)
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...address } : addr
          ),
        }));
      },
      deleteAddress: async (id) => {
        const { error } = await supabase
          .from('shipping_addresses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
        }));
      },
      fetchAddresses: async () => {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .order('is_default', { ascending: false });

        if (error) throw error;

        set({ addresses: data || [] });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (item) => 
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.id === item.id);
          
          if (existingItemIndex !== -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + 1
            };
            return { items: newItems };
          }
          
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, newQuantity) =>
        set((state) => {
          if (newQuantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }
          
          const itemIndex = state.items.findIndex(item => item.id === id);
          if (itemIndex === -1) return state;
          
          const newItems = [...state.items];
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            quantity: newQuantity
          };
          
          return { items: newItems };
        }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'cart-storage',
    }
  )
);

export const useContactStore = create<ContactState>()(
  persist(
    (set) => ({
      contactInfo: {
        email: 'contact@straighten-up.com',
        phone: '+1 (555) 123-4567',
        address: '123 Posture Lane, Health City, 12345',
        workingHours: {
          weekdays: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        }
      },
      officeLocations: [],
      updateContactInfo: (info) =>
        set((state) => ({
          contactInfo: {
            ...state.contactInfo,
            ...info,
            workingHours: {
              ...state.contactInfo.workingHours,
              ...(info.workingHours || {})
            }
          }
        })),
      addOfficeLocation: (location) =>
        set((state) => ({
          officeLocations: [
            ...state.officeLocations,
            { ...location, id: crypto.randomUUID() }
          ]
        })),
      removeOfficeLocation: (id) =>
        set((state) => ({
          officeLocations: state.officeLocations.filter(
            (location) => location.id !== id
          )
        })),
      updateOfficeLocation: (id, location) =>
        set((state) => ({
          officeLocations: state.officeLocations.map((loc) =>
            loc.id === id ? { ...loc, ...location } : loc
          )
        }))
    }),
    {
      name: 'contact-storage'
    }
  )
);

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'USD',
      exchangeRates: {},
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      updateExchangeRates: async () => {
        try {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const data = await response.json();
          set({ exchangeRates: data.rates });
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
        }
      },
      convertPrice: (amount, fromCurrency, toCurrency) => {
        const { exchangeRates } = get();
        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
          return amount;
        }
        
        // Convert to USD first (base currency)
        const usdAmount = amount / exchangeRates[fromCurrency];
        // Convert from USD to target currency
        const convertedAmount = usdAmount * exchangeRates[toCurrency];
        
        // Round to nearest 0.1
        return currency(convertedAmount, { precision: 1 }).value;
      }
    }),
    {
      name: 'currency-storage',
    }
  )
);