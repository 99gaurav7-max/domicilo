import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing or using Domicilo, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of changes.'
  },
  {
    title: 'Account Registration',
    content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately of any unauthorized use.'
  },
  {
    title: 'User Responsibilities',
    content: 'Property owners are responsible for ensuring property listings are accurate and comply with applicable laws. Tenants agree to provide truthful information in enquiries. All users agree not to misuse the platform for fraudulent or illegal purposes.'
  },
  {
    title: 'Property Listings',
    content: 'Owners represent that they have the legal authority to list properties. All listing information must be accurate including pricing, availability, and amenities. Domicilo reserves the right to remove listings that violate our policies.'
  },
  {
    title: 'Payments & Fees',
    content: 'Rent payments are processed through Razorpay. Domicilo does not hold or manage tenant deposits. Owners are responsible for setting rent amounts and collecting payments. Transaction charges may apply as per the payment gateway terms.'
  },
  {
    title: 'Privacy & Data',
    content: 'Your use of Domicilo is governed by our Privacy Policy. We take data protection seriously and implement industry-standard security measures. We do not share your personal information with third parties without your consent.'
  },
  {
    title: 'Intellectual Property',
    content: 'Domicilo and its content, features, and functionality are owned by Domicilo and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.'
  },
  {
    title: 'Limitation of Liability',
    content: 'Domicilo is provided "as is" without warranties of any kind. We are not liable for disputes between owners and tenants, property condition, or any damages arising from platform use. Our liability is limited to the maximum extent permitted by law.'
  },
  {
    title: 'Termination',
    content: 'We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity. Users may delete their accounts at any time through dashboard settings or by contacting support.'
  },
  {
    title: 'Contact',
    content: 'For questions about these terms, contact us at support@domicilo.com or call +91 99999 99999.'
  }
];

export default function TermsServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="gradient-bg relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-royal-400/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Terms of Service</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-amber-300" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-amber-100/80 max-w-2xl text-lg">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed">
          These terms govern your use of the Domicilo platform. Please read them carefully before using our services.
        </motion.p>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 dark:border-gray-800 py-10 text-center">
        <p className="text-sm text-gray-400">
          Questions? Email{' '}
          <a href="mailto:support@domicilo.com" className="text-royal-500 hover:text-royal-600">support@domicilo.com</a>
        </p>
      </section>
    </div>
  );
}
