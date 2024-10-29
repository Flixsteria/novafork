class BitcoinModal {
  constructor() {
    this.modal = document.getElementById('bitcoinPopup');
    this.closeButton = document.getElementById('closeBitcoinPopup');
    this.openButton = document.getElementById('openBitcoinPopup');
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.openButton) {
      this.openButton.addEventListener('click', () => this.show());
    }
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

export default BitcoinModal;
