import { motion } from 'framer-motion';

function Input({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  className = '',
  labelClassName = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label
        htmlFor={name}
        className={`block text-sm font-['Lora'] text-[var(--primary)] ${labelClassName}`}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`mt-1 block w-full px-3 py-2 bookish-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] ${className}`}
      />
    </motion.div>
  );
}

export default Input;