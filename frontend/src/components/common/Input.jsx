function Input({ label, name, type, value, onChange, placeholder, required }) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--primary)]">
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
        />
      </div>
    );
  }
  
  export default Input;