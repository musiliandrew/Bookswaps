import { motion } from 'framer-motion';

function StaticPage({ title, contentKey }) {
  const content = {
    terms: (
      <p className="text-[var(--text)] font-['Open_Sans']">
        Welcome to BookSwap’s Terms of Service. This is a placeholder. Please review our full terms for details on usage, responsibilities, and policies.
      </p>
    ),
    privacy: (
      <p className="text-[var(--text)] font-['Open_Sans']">
        BookSwap values your privacy. This is a placeholder. Please review our full privacy policy for information on data collection and usage.
      </p>
    ),
    contact: (
      <p className="text-[var(--text)] font-['Open_Sans']">
        Get in touch with BookSwap. This is a placeholder. Email us at support@bookswap.com or use our contact form.
      </p>
    ),
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-3xl mx-auto bookish-glass bookish-shadow p-8 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-3xl font-['Lora'] text-[var(--primary)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {content[contentKey] || <p className="text-[var(--text)] font-['Open_Sans']">Content not found.</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default StaticPage;