import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide directly when creating an account, listing properties, or submitting enquiries. This includes your name, email address, phone number, property details, and payment information. We also collect usage data such as page visits, feature interactions, and device information to improve our services.'
  },
  {
    title: 'How We Use Your Information',
    content: 'Your information is used to provide and maintain our platform, process transactions, send notifications about your account or properties, respond to enquiries, and improve our services. We may also use your email to send important updates about our platform or changes to our terms.'
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell your personal information. Property-related information (such as property details and availability) is shared with potential tenants who enquire. Payment information is processed securely through Razorpay and is not stored on our servers. We may share information if required by law or to protect our rights.'
  },
  {
    title: 'Data Security',
    content: 'We implement industry-standard security measures including encryption, secure socket layer technology (SSL), and regular security audits. Access to personal information is restricted to authorized personnel only. However, no method of transmission over the Internet is 100% secure.'
  },
  {
    title: 'Data Retention',
    content: 'We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data by contacting our support team. We may retain certain information as required by law or for legitimate business purposes.'
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You can update your account information anytime through your dashboard. For account deletion requests or other privacy concerns, please contact us at support@domicilo.com.'
  },
  {
    title: 'Cookies',
    content: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser. Disabling cookies may affect certain features of the platform.'
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any material changes via email or through a notice on our platform. Continued use of the platform after changes constitutes acceptance of the updated policy.'
  },
  {
    title: 'Contact Us',
    content: 'If you have any questions about this privacy policy or our data practices, please contact us at support@domicilo.com or call us at +91 99999 99999.'
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="gradient-bg relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-royal-400/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Privacy Policy</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-amber-300" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-amber-100/80 max-w-2xl text-lg">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed">
          At Domicilo, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our platform.
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
          For any privacy-related concerns, email us at{' '}
          <a href="mailto:support@domicilo.com" className="text-royal-500 hover:text-royal-600">support@domicilo.com</a>
        </p>
      </section>
    </div>
  );
}
