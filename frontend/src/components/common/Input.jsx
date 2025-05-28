import { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  className = '',
  labelClassName = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.label
        htmlFor={name}
        className={`block text-sm font-semibold font-['Lora'] text-[var(--primary)] mb-2 ${labelClassName}`}
        animate={{ 
          scale: isFocused || value ? 1.05 : 1,
          color: isFocused ? 'var(--accent)' : 'var(--primary)'
        }}
        transition={{ duration: 0.2 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>
      
      <div className="relative">
        <motion.input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`bookish-input w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)] placeholder-gray-400 ${className}`}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isFocused 
              ? 'inset 0 0 0 2px var(--primary), 0 0 0 4px rgba(69, 106, 118, 0.1)'
              : 'inset 0 0 0 1px rgba(69, 106, 118, 0.2)'
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default Input;