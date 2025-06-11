import { motion } from 'framer-motion';

const FormProgress = ({ progress }) => (
  <motion.div className="w-full bg-gray-200 rounded-full h-1 mb-6">
    <motion.div
      className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </motion.div>
);

export default FormProgress;