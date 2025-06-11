import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  labelClassName = '',
  error = '',
  success = false,
  rows = 5, // For textarea
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputProps = {
    id: name,
    name,
    value,
    onChange,
    placeholder,
    required,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: `bookish-input w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)] placeholder-gray-400 border ${error ? 'border-red-500' : success ? 'border-green-500' : 'border-transparent'} ${className}`,
    whileFocus: { scale: 1.02 },
    transition: { duration: 0.2 },
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined,
  };

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.label
        htmlFor={name}
        className={`block text-sm font-semibold font-['Lora'] text-[var(--primary)] ${labelClassName}`}
        animate={{
          scale: isFocused || value ? 1.05 : 1,
          color: isFocused ? 'var(--accent)' : 'var(--primary)',
        }}
        transition={{ duration: 0.2 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>
      <div className="relative">
        {type === 'textarea' ? (
          <motion.textarea
            {...inputProps}
            rows={rows}
          />
        ) : (
          <motion.input
            {...inputProps}
            type={type}
          />
        )}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isFocused
              ? `inset 0 0 0 2px var(--primary), 0 0 0 4px var(--primary-shadow)`
              : `inset 0 0 0 1px var(--border)`
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      {error && (
        <motion.p
          id={`${name}-error`}
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  rows: PropTypes.number,
};

export default Input;