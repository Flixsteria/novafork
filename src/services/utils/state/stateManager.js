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
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    console.log('State updated:', this.state);
  }

  getState() {
    return { ...this.state };
  }
}

export default new StateManager();
