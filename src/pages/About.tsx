import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Clock, CheckCircle, Globe, Lightbulb, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070"
            alt="Team Collaboration"
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
              Revolutionizing Posture Health
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              At Straighten-Up, we're dedicated to improving lives through innovative posture technology and expert guidance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-xl backdrop-blur-xl border border-purple-500/20"
            >
              <Target className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-gray-300">
                To empower individuals to achieve better posture and improve their quality of life through cutting-edge technology and personalized solutions.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-xl backdrop-blur-xl border border-purple-500/20"
            >
              <Globe className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-xl font-bold mb-4 text-white">Our Vision</h3>
              <p className="text-gray-300">
                To be the global leader in posture correction technology, making better posture accessible to everyone, everywhere.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-xl backdrop-blur-xl border border-purple-500/20"
            >
              <Heart className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-xl font-bold mb-4 text-white">Our Values</h3>
              <p className="text-gray-300">
                Innovation, customer success, and continuous improvement drive everything we do. We're committed to making a positive impact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Innovation at Our Core
              </h2>
              <div className="space-y-4">
                {[
                  'AI-powered posture analysis',
                  'Real-time feedback system',
                  'Cloud-based progress tracking',
                  'Personalized improvement plans'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img
                src="https://res.cloudinary.com/dgifshcbo/image/upload/v1744934102/st1_qzdemb.png"
                alt="Posture Device"
                className="rounded-xl shadow-2xl shadow-purple-500/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-300">
              Experts dedicated to revolutionizing posture health
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Zakhar Yagudin',
                role: 'Chief Executive Officer (CEO)',
                image: 'https://res.cloudinary.com/dgifshcbo/image/upload/v1744939883/Screenshot_2025-04-18_at_03.46.28_olfpdr_442394.png',
                bio: 'Experienced AI and robotics specialist driving strategic innovation and technological advancement in posture correction solutions'
              },
              {
                name: 'Kelechi Ekpemiro',
                role: 'Chief Operating Officer (COO)',
                image: 'https://res.cloudinary.com/dgifshcbo/image/upload/v1744939840/IMG_2331_2_dz9c2a_40112f.jpg',
                bio: 'IT project management and information systems expert focused on operational efficiency, product development, and seamless technical integration'
              },
              {
                name: 'Victoria Palagina',
                role: 'Chief Financial Officer (CFO)',
                image: 'https://res.cloudinary.com/dgifshcbo/image/upload/v1744939996/Screenshot_2025-04-18_at_03.47.56_kv08rw_0d325a.png',
                bio: 'Bioinformatics professional leveraging analytical insights and financial strategies to optimize growth and resource management'
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl overflow-hidden backdrop-blur-xl border border-purple-500/20"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{member.name}</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  <p className="text-gray-300">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Our Journey
            </h2>
            <p className="text-xl text-gray-300">
              Milestones that shaped our success
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                year: '2023',
                title: 'Project Initiated',
                description: 'The Project Straighten-Up was initiated to tackle poor posture with cutting-edge wearable technology.'
              },
              {
                year: '2023',
                title: 'First Prototype',
                description: 'Successfully developed and tested our innovative wearable device prototype.'
              },
              {
                year: '2024',
                title: 'MVP',
                description: 'Developed the first complete solution as validation of the solution and methodology to experts and the market.'
              },
              {
                year: '2025',
                title: 'Company Founded',
                description: 'The Company Straighten-Up was founded with a vision to revolutionize posture correction through technology.'
              },
              {
                year: '2025',
                title: 'Market Launch',
                description: 'Launched our first product line.'
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-8"
              >
                <div className="w-24 text-right">
                  <span className="text-purple-400 font-bold">{event.year}</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-purple-400 relative">
                  <div className="absolute w-px h-full bg-purple-400/20 left-1/2 transform -translate-x-1/2" />
                </div>
                <div className="flex-1 bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-xl backdrop-blur-xl border border-purple-500/20">
                  <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-300">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Join Our Mission
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Be part of the posture revolution. Together, we can create a future of better health and well-being.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;