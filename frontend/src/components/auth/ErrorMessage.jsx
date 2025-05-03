function ErrorMessage({ message }) {
    if (!message) return null;
  
    return (
      <div className="text-red-500 text-sm mt-2">
        {message}
      </div>
    );
  }
  
  export default ErrorMessage;