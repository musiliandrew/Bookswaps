const Pagination = ({ type, currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between mt-4">
      <button
        onClick={() => onPageChange(type, currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary px-4 py-2 rounded-xl disabled:opacity-50"
        style={{ color: 'var(--neutral-600)' }}
      >
        Previous
      </button>
      <span className="font-['Open_Sans']" style={{ color: 'var(--neutral-700)' }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(type, currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary px-4 py-2 rounded-xl disabled:opacity-50"
        style={{ color: 'var(--neutral-600)' }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;