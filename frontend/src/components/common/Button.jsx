function Button({ type = 'button', text, disabled, className, onClick }) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`bg-[var(--primary)] text-[var(--secondary)] font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {text}
      </button>
    );
  }
  
  export default Button;