const Pagination = ({ type, currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between mt-4">
      <button
        onClick={() => onPageChange(type, currentPage - 1)}
        disabled={currentPage === 1}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-[var(--text)] font-['Open_Sans']">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(type, currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;