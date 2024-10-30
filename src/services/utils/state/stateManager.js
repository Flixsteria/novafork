class StateManager {
  constructor() {
    this.state = {
      currentPage: 1,
      totalPages: 1,
      currentMediaType: 'trending',
      searchQuery: '',
      currentActorId: null,
      currentCompanyId: null,
      currentCollectionId: null,
      currentFranchiseKeywordId: null,
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
    console.log('State updated:', this.state);
  }

  getState() {
    return { ...this.state };
  }
}

export default new StateManager();
