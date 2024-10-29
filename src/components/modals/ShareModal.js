class ShareModal {
  constructor() {
    this.modal = document.getElementById('shareModal');
    this.closeButton = document.getElementById('closeModal');
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.hide());
    }
    // Close on outside click
    if (this.modal) {
      this.modal.addEventListener('click', e => {
        if (e.target === this.modal) {
          this.hide();
        }
      });
    }
  }

  show() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }
}

export default ShareModal;
