import { motion } from 'framer-motion';

const Button = ({ 
  type = 'button', 
  text, 
  disabled, 
  className = '', 
  onClick, 
  isLoading = false 
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`bookish-button-enhanced relative overflow-hidden w-full py-4 px-6 rounded-xl font-['Open_Sans'] font-semibold text-white ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{ x: disabled || isLoading ? 0 : [-100, 100] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          repeatType: 'loop',
          ease: 'linear'
        }}
        style={{ opacity: 0.1 }}
      />
      
      <div className="relative flex items-center justify-center">
        {isLoading && (
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <span>{text}</span>
      </div>
    </motion.button>
  );
};

export default Button;