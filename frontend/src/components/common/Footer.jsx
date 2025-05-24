import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <motion.footer
      className="bg-[var(--primary)] text-[var(--secondary)] p-4 frosted-glass bookish-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto text-center">
        <motion.div
          className="space-x-4 font-['Caveat'] text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Link
            to="/privacy"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Contact
          </Link>
        </motion.div>
        <motion.div
          className="mt-4 flex justify-center space-x-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <a
            href="https://twitter.com/bookswap"
            aria-label="Twitter"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          <a
            href="https://facebook.com/bookswap"
            aria-label="Facebook"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/company/bookswap"
            aria-label="LinkedIn"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
            </svg>
          </a>
        </motion.div>
        <motion.p
          className="mt-2 text-sm font-['Open_Sans']"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          © 2025 BookSwap. All rights reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
}

export default Footer;