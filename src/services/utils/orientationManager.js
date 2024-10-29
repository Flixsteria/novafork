class OrientationManager {
  constructor() {
    this.storageKey = 'orientationLock';
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const toggle = document.getElementById('orientationLockToggle');
      if (toggle) {
        toggle.checked = this.isEnabled();
        toggle.addEventListener('change', event => {
          this.setEnabled(event.target.checked);
        });
      }
    });
  }

  isEnabled() {
    return JSON.parse(localStorage.getItem(this.storageKey) || 'false');
  }

  setEnabled(enabled) {
    localStorage.setItem(this.storageKey, enabled);
    if (enabled) {
      this.enableLock();
    } else {
      this.disableLock();
    }
  }

  async enableLock() {
    const element = document.documentElement;

    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }
    } catch (error) {
      console.warn('Orientation/Fullscreen lock failed:', error);
    }
  }

  async disableLock() {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        await screen.orientation.unlock();
      }

      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Orientation/Fullscreen unlock failed:', error);
    }
  }

  async lockForElement(element) {
    if (!element || !this.isEnabled()) return;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }

      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (error) {
      console.warn('Element orientation lock failed:', error);
    }
  }
}

export default new OrientationManager();
