class PaginationService {
  constructor() {
    this.prevButton = document.getElementById('prevPage');
    this.nextButton = document.getElementById('nextPage');
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('pageChange', { detail: -1 }));
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('pageChange', { detail: 1 }));
      });
    }
  }

  updateControls(currentPage, totalPages) {
    if (this.prevButton) {
      this.prevButton.disabled = currentPage <= 1;
    }
    if (this.nextButton) {
      this.nextButton.disabled = currentPage >= totalPages;
    }
  }
}

export default new PaginationService();
