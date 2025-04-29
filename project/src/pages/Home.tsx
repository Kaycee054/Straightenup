import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Brain, Zap, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLearnMore = () => {
    navigate('/about');
  };

  const handleShopNow = () => {
    navigate('/store');
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/store');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 z-10" />
          <img
          src="https://res.cloudinary.com/dgifshcbo/image/upload/v1744932453/2st-removebg-preview_rxj6pf.png"
            alt="Posture Technology"
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleShopNow}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 flex items-center"
                >
                  {t('home.hero.shopNow')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLearnMore}
                  className="border border-purple-500 px-8 py-4 rounded-full font-semibold hover:bg-purple-900/30 transition duration-300"
                >
                  {t('home.hero.learnMore')}
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
          src="https://res.cloudinary.com/dgifshcbo/image/upload/v1744932458/Leonardo_Phoenix_woman_wearing_a_sports_bra_with_her_back_face_1_nqjaaz.jpg"
                alt="Smart Posture Device"
                className="rounded-2xl shadow-2xl shadow-purple-500/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Next-Gen Posture Technology
            </h2>
            <p className="text-xl text-gray-400">Experience the future of posture correction</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Advanced algorithms provide real-time posture analysis and personalized recommendations'
              },
              {
                icon: Zap,
                title: 'Instant Feedback',
                description: 'Get immediate haptic feedback when your posture needs correction'
              },
              {
                icon: Smartphone,
                title: 'Smart Integration',
                description: 'Seamlessly connects with your devices for comprehensive tracking'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, translateY: -10 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-2xl backdrop-blur-xl border border-purple-500/20"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '98%', label: 'User Satisfaction' },
              { number: '50K+', label: 'Active Users' },
              { number: '30min', label: 'Daily Average' },
              { number: '85%', label: 'Posture Improvement' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl border border-purple-500/20"
              >
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              User Experiences
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Lara Chenov',
                role: 'Tech Professional',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                quote: "The real-time feedback has completely transformed my posture habits."
              },
              {
                name: 'James Wilson',
                role: 'Remote Worker',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
                quote: "As a developer, this device has been a game-changer for my work setup."
              },
              {
                name: 'Emily Rodriguez',
                role: 'Fitness Instructor',
                image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
                quote: "I recommend Straighten-Up to all my clients. The results are amazing."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-2xl backdrop-blur-xl border border-purple-500/20"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-purple-500"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-purple-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-purple-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Transform Your Posture Today
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied users who have improved their posture and well-being with Straighten-Up
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 inline-flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;