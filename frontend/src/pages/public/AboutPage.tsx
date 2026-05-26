import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Building2, Users, Shield, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-royal-500 to-royal-700 relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">About</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">Domicilo</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-blue-100/80 max-w-2xl text-lg">
            We're on a mission to simplify rental management for property owners and tenants across India.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-4">Our Story</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Domicilo was founded to solve the challenges property owners face in managing rentals — from tenant onboarding and rent collection to maintenance tracking and financial reporting. We built a platform that combines powerful tools for owners with a seamless experience for tenants.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Building2, label: 'Properties Managed', value: '500+' },
            { icon: Users, label: 'Active Users', value: '2,000+' },
            { icon: Shield, label: 'Secure Transactions', value: '10,000+' },
            { icon: Award, label: 'Years Experience', value: '5+' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-royal-500/10 to-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-royal-500 dark:text-royal-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50/50 dark:bg-gray-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                To empower property owners with modern tools that streamline every aspect of rental management, while providing tenants with a transparent and hassle-free living experience.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                We believe in leveraging technology to bridge the gap between owners and tenants, making rental management efficient, transparent, and accessible to all.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-8">
              <h3 className="text-xl font-semibold font-display text-gray-900 dark:text-white mb-4">Core Values</h3>
              <ul className="space-y-3">
                {[
                  'Transparency in all transactions and communications',
                  'Security-first approach to data and payments',
                  'Continuous innovation to simplify property management',
                  'Customer-centric support and service',
                ].map((v, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-500 dark:text-gray-400 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-royal-500 mt-1.5 flex-shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Join thousands of property owners and tenants already using Domicilo.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-royal-600 to-gold-500 text-white font-semibold hover:shadow-xl hover:shadow-royal-500/30 transition-all hover:-translate-y-0.5">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
