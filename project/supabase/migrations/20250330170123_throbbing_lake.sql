/*
  # Add sample posture correction devices
  
  1. Changes
    - Insert sample products into the products table
    - Include a variety of devices and accessories
    - Add realistic features and descriptions
*/

INSERT INTO products (name, price, description, image_url, category, rating, features, in_stock, pre_order)
VALUES
  (
    'Straighten-Up Pro',
    199.99,
    'Advanced posture correction device with real-time feedback and AI-powered analysis. Perfect for professionals who spend long hours at their desk.',
    'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&q=80&w=800',
    'Devices',
    5,
    ARRAY[
      'Real-time posture monitoring',
      'AI-powered analysis',
      'Haptic feedback',
      'Mobile app integration',
      '7-day battery life',
      'Water-resistant design'
    ],
    true,
    false
  ),
  (
    'Straighten-Up Lite',
    149.99,
    'Lightweight and comfortable posture device perfect for everyday use. Ideal for beginners and those new to posture correction.',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800',
    'Devices',
    4,
    ARRAY[
      'Compact design',
      'Basic posture tracking',
      'Vibration alerts',
      'Mobile app support',
      '5-day battery life',
      'Beginner-friendly interface'
    ],
    true,
    false
  ),
  (
    'Straighten-Up Elite',
    299.99,
    'Premium posture correction system with advanced analytics, personalized coaching, and professional-grade features.',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
    'Devices',
    5,
    ARRAY[
      'Advanced posture analytics',
      'Personal coaching system',
      'Multi-zone monitoring',
      'Professional reporting',
      '10-day battery life',
      'Premium materials'
    ],
    false,
    true
  ),
  (
    'Straighten-Up Sport',
    179.99,
    'Designed specifically for athletes and fitness enthusiasts. Features enhanced durability and sweat resistance.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    'Devices',
    4,
    ARRAY[
      'Sport-specific tracking',
      'Impact resistance',
      'Enhanced durability',
      'Sweat-proof design',
      'Real-time workout feedback',
      'Activity recognition'
    ],
    true,
    false
  ),
  (
    'Posture Comfort Cushion',
    59.99,
    'Ergonomic cushion designed to complement your Straighten-Up device. Provides additional support for proper sitting posture.',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
    'Accessories',
    4,
    ARRAY[
      'Memory foam construction',
      'Ergonomic design',
      'Breathable fabric',
      'Machine washable',
      'Non-slip base'
    ],
    true,
    false
  ),
  (
    'Straighten-Up Mini',
    99.99,
    'Ultra-compact posture sensor perfect for travel and occasional use. Simplified features focus on essential posture tracking.',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800',
    'Devices',
    4,
    ARRAY[
      'Ultra-compact design',
      'Basic posture alerts',
      'Simple app interface',
      '3-day battery life',
      'Travel-friendly'
    ],
    true,
    false
  ),
  (
    'Pro Charging Dock',
    39.99,
    'Premium charging solution for Straighten-Up devices. Features fast charging and elegant design.',
    'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&q=80&w=800',
    'Accessories',
    5,
    ARRAY[
      'Fast charging capability',
      'LED charging indicator',
      'Premium aluminum construction',
      'Compatible with all models',
      'Compact design'
    ],
    true,
    false
  ),
  (
    'Straighten-Up Kids',
    129.99,
    'Specially designed for children and teenagers. Features fun animations and gamified posture training.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    'Devices',
    4,
    ARRAY[
      'Kid-friendly design',
      'Gamified interface',
      'Parental controls',
      'Impact resistant',
      'Fun animations',
      'Educational content'
    ],
    true,
    false
  );