class AdvancedSearchService {
  constructor(searchService, stateManager) {
    this.searchService = searchService;
    this.stateManager = stateManager;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const actorInput = document.getElementById('actorSearchInput');
    if (actorInput) {
      let actorDebounceTimer;
      actorInput.addEventListener('input', () => {
        clearTimeout(actorDebounceTimer);
        actorDebounceTimer = setTimeout(async () => {
          const query = actorInput.value.trim();
          if (query.length >= 2) {
            try {
              const result = await this.searchService.searchActor(query);
              if (result.results && result.results.length > 0) {
                this.stateManager.setState({
                  currentMediaType: 'actor',
                  currentActorId: result.results[0].id,
                  currentPage: 1,
                });
                this.handleFilterChange();
              }
            } catch (error) {
              console.error('Actor search failed:', error);
            }
          } else {
            this.stateManager.setState({
              currentMediaType: 'trending',
              currentActorId: null,
            });
            this.handleFilterChange();
          }
        }, 500);
      });
    }

    const companyInput = document.getElementById('companySearchInput');
    const companySuggestions = document.getElementById('companySuggestions');
    if (companyInput && companySuggestions) {
      let companyDebounceTimer;
      companyInput.addEventListener('input', () => {
        clearTimeout(companyDebounceTimer);
        companyDebounceTimer = setTimeout(async () => {
          const query = companyInput.value.trim();
          if (query.length >= 2) {
            try {
              const result = await this.searchService.searchCompany(query);
              if (result.results) {
                this.displaySuggestions(result.results, companySuggestions, company => {
                  companyInput.value = company.name;
                  this.stateManager.setState({
                    currentMediaType: 'company',
                    currentCompanyId: company.id,
                    currentPage: 1,
                  });
                  this.handleFilterChange();
                  companySuggestions.classList.remove('show');
                });
              }
            } catch (error) {
              console.error('Company search failed:', error);
            }
          } else {
            companySuggestions.classList.remove('show');
            this.stateManager.setState({
              currentMediaType: 'trending',
              currentCompanyId: null,
            });
            this.handleFilterChange();
          }
        }, 500);
      });
    }

    const collectionInput = document.getElementById('collectionSearchInput');
    const collectionSuggestions = document.getElementById('collectionSuggestions');
    if (collectionInput && collectionSuggestions) {
      let collectionDebounceTimer;
      collectionInput.addEventListener('input', () => {
        clearTimeout(collectionDebounceTimer);
        collectionDebounceTimer = setTimeout(async () => {
          const query = collectionInput.value.trim();
          if (query.length >= 2) {
            try {
              const result = await this.searchService.searchCollection(query);
              if (result.results) {
                this.displaySuggestions(result.results, collectionSuggestions, collection => {
                  collectionInput.value = collection.name;
                  this.stateManager.setState({
                    currentMediaType: 'collection',
                    currentCollectionId: collection.id,
                    currentPage: 1,
                  });
                  this.handleFilterChange();
                  collectionSuggestions.classList.remove('show');
                });
              }
            } catch (error) {
              console.error('Collection search failed:', error);
            }
          } else {
            collectionSuggestions.classList.remove('show');
            this.stateManager.setState({
              currentMediaType: 'trending',
              currentCollectionId: null,
            });
            this.handleFilterChange();
          }
        }, 500);
      });
    }

    const franchiseInput = document.getElementById('franchiseSearchInput');
    const franchiseSuggestions = document.getElementById('franchiseSuggestions');
    if (franchiseInput && franchiseSuggestions) {
      let franchiseDebounceTimer;
      franchiseInput.addEventListener('input', () => {
        clearTimeout(franchiseDebounceTimer);
        franchiseDebounceTimer = setTimeout(async () => {
          const query = franchiseInput.value.trim();
          if (query.length >= 2) {
            try {
              const result = await this.searchService.searchKeyword(query);
              if (result.results) {
                this.displaySuggestions(result.results, franchiseSuggestions, keyword => {
                  franchiseInput.value = keyword.name;
                  this.stateManager.setState({
                    currentMediaType: 'franchise',
                    currentFranchiseKeywordId: keyword.id,
                    currentPage: 1,
                  });
                  this.handleFilterChange();
                  franchiseSuggestions.classList.remove('show');
                });
              }
            } catch (error) {
              console.error('Franchise search failed:', error);
            }
          } else {
            franchiseSuggestions.classList.remove('show');
            this.stateManager.setState({
              currentMediaType: 'trending',
              currentFranchiseKeywordId: null,
            });
            this.handleFilterChange();
          }
        }, 500);
      });
    }

    document.addEventListener('click', e => {
      const suggestions = document.querySelectorAll('.suggestions');
      suggestions.forEach(suggestion => {
        if (!suggestion.contains(e.target)) {
          suggestion.classList.remove('show');
        }
      });
    });
  }

  displaySuggestions(items, container, onSelect) {
    container.innerHTML = '';

    if (items && items.length > 0) {
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-2 hover:bg-gray-700 cursor-pointer transition-colors duration-200';
        div.textContent = item.name;
        div.addEventListener('click', () => onSelect(item));
        container.appendChild(div);
      });
      container.classList.add('show');
    } else {
      const div = document.createElement('div');
      div.className = 'p-2 text-gray-400';
      div.textContent = 'No results found';
      container.appendChild(div);
      container.classList.add('show');
    }
  }

  handleFilterChange() {
    const event = new CustomEvent('filterChange');
    document.dispatchEvent(event);
  }

  clearAdvancedFilters() {
    const inputs = [
      'actorSearchInput',
      'companySearchInput',
      'collectionSearchInput',
      'franchiseSearchInput',
    ];

    inputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = '';
      }
    });

    this.stateManager.setState({
      currentMediaType: 'trending',
      currentActorId: null,
      currentCompanyId: null,
      currentCollectionId: null,
      currentFranchiseKeywordId: null,
      currentPage: 1,
    });

    this.handleFilterChange();
  }
}

export default AdvancedSearchService;
