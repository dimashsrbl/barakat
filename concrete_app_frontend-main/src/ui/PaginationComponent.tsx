interface Props {
    currentPage: any;
    totalPages?: any;
    onPageChange?: any;
    prevButtonText?: any;
    nextButtonText?: any;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, prevButtonText, nextButtonText }: Props) => {
    const pageNumbers:any = [];
  
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  
    const getPageNumbersWithEllipsis = () => {
      const visiblePages = [];
      const maxVisiblePages = 5; // Максимальное количество видимых номеров страниц
  
      if (totalPages <= maxVisiblePages) {
        return pageNumbers;
      }
  
      const minVisiblePage = Math.max(1, currentPage - 2);
      const maxVisiblePage = Math.min(totalPages, currentPage + 2);
  
      if (minVisiblePage > 1) {
        visiblePages.push(1);
      }
  
      if (minVisiblePage > 2) {
        visiblePages.push('...');
      }
  
      for (let i = minVisiblePage; i <= maxVisiblePage; i++) {
        visiblePages.push(i);
      }
  
      if (maxVisiblePage < totalPages - 1) {
        visiblePages.push('...');
      }
  
      if (maxVisiblePage < totalPages) {
        visiblePages.push(totalPages);
      }
  
      return visiblePages;
    };
  
    return (
      <nav>
        <ul className='pagination df jcc'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button onClick={() => onPageChange(currentPage - 1)} className='page-link'>
              {prevButtonText}
            </button>
          </li>
          {getPageNumbersWithEllipsis().map((number: any, index: any) => (
            <li key={index} className={`page-item df ${number === '...' ? 'disabled' : ''}`}>
              <button onClick={() => number !== '...' && onPageChange(number)} className={`page-link ${number === currentPage ? 'active' : ''}`}>
                {number}
              </button>
            </li>
          ))}
          <li className={`page-item df ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button onClick={() => onPageChange(currentPage + 1)} className='page-link'>
              {nextButtonText}
            </button>
          </li>
        </ul>
      </nav>
    );
  };