import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Product',
    question: 'How does the Straighten-Up device work?',
    answer: 'The Straighten-Up device uses advanced sensors and AI technology to monitor your posture in real-time. When it detects poor posture, it provides gentle vibration feedback to remind you to correct your position. The device connects to our mobile app for detailed tracking and personalized recommendations.'
  },
  {
    category: 'Product',
    question: 'What\'s the battery life of the device?',
    answer: 'The Straighten-Up device features a long-lasting battery that can run for up to 7 days on a single charge with normal use. Charging takes approximately 2 hours using the provided USB-C cable.'
  },
  {
    category: 'Product',
    question: 'Is the device water-resistant?',
    answer: 'Yes, the Straighten-Up device is rated IPX5 water-resistant, making it safe to wear during exercise and light rain. However, it should not be submerged in water or worn while swimming.'
  },
  {
    category: 'Usage',
    question: 'How long should I wear the device each day?',
    answer: 'For optimal results, we recommend wearing the device for at least 4-6 hours per day during your regular activities. You can wear it longer if desired, but it\'s important to give your body regular breaks and not become overly dependent on the device.'
  },
  {
    category: 'Usage',
    question: 'Can I wear it while exercising?',
    answer: 'Yes! The Straighten-Up device is designed to be worn during various activities, including exercise. It\'s particularly useful during activities like weightlifting and yoga where proper form is crucial.'
  },
  {
    category: 'Health',
    question: 'Is it safe to use the device?',
    answer: 'Yes, the Straighten-Up device is completely safe to use. It has been tested extensively and certified by relevant health and safety organizations. The device uses gentle vibrations that don\'t interfere with your daily activities or cause any discomfort.'
  },
  {
    category: 'Health',
    question: 'How long until I see results?',
    answer: 'Most users report increased posture awareness within the first week of use. Noticeable improvements in posture typically occur within 2-4 weeks of consistent use, though individual results may vary depending on factors like current posture habits and usage consistency.'
  },
  {
    category: 'Technical',
    question: 'Is the app available for both iOS and Android?',
    answer: 'Yes, our companion app is available for both iOS and Android devices. It requires iOS 12.0 or later, or Android 8.0 or later for optimal performance.'
  },
  {
    category: 'Support',
    question: 'What\'s included in the warranty?',
    answer: 'The Straighten-Up device comes with a 1-year limited warranty that covers manufacturing defects and hardware malfunctions. This doesn\'t cover damage from accidents, misuse, or unauthorized modifications.'
  },
  {
    category: 'Support',
    question: 'How can I get technical support?',
    answer: 'Technical support is available through multiple channels: our in-app chat support, email support, or by calling our dedicated support line. Our support team is available Monday through Friday, 9 AM to 6 PM EST.'
  }
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2070"
            alt="Support Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Frequently Asked Questions
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Find answers to common questions about Straighten-Up products and services
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-purple-600/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl backdrop-blur-xl border border-purple-500/20 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-purple-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <div className="pt-2 border-t border-purple-500/20">
                        <p className="text-gray-300">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-blue-900/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Still Need Help?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Our support team is here to assist you with any questions you may have.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300"
            >
              Contact Support
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;