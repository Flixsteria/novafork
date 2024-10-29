class PaginationService {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (!prevButton.disabled) {
          this.handlePageChange(-1);
        }
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (!nextButton.disabled) {
          this.handlePageChange(1);
        }
      });
    }
  }

  handlePageChange(delta) {
    const event = new CustomEvent('pageChange', { detail: delta });
    document.dispatchEvent(event);
  }

  updateControls(currentPage, totalPages) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    if (prevButton) {
      const isFirstPage = currentPage <= 1;
      prevButton.disabled = isFirstPage;
      prevButton.classList.toggle('opacity-50', isFirstPage);
      prevButton.classList.toggle('cursor-not-allowed', isFirstPage);
      prevButton.classList.toggle('hover:from-purple-700', !isFirstPage);
      prevButton.classList.toggle('hover:to-pink-700', !isFirstPage);
    }

    if (nextButton) {
      const isLastPage = currentPage >= totalPages;
      nextButton.disabled = isLastPage;
      nextButton.classList.toggle('opacity-50', isLastPage);
      nextButton.classList.toggle('cursor-not-allowed', isLastPage);
      nextButton.classList.toggle('hover:from-purple-700', !isLastPage);
      nextButton.classList.toggle('hover:to-pink-700', !isLastPage);
    }
  }
}

export default new PaginationService();
