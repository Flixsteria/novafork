import { debounce } from '../../services/utils/mediaUtils.js';
import stateManager from '../../services/utils/stateManager.js';

class SearchBar {
  constructor(searchInputId, suggestionsId, onSearch, onSuggestionSelect) {
    this.searchInput = document.getElementById(searchInputId);
    this.suggestionsContainer = document.getElementById(suggestionsId);
    this.onSearch = onSearch;
    this.onSuggestionSelect = onSuggestionSelect;
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.searchInput || !this.suggestionsContainer) return;

    // Search input handler
    this.searchInput.addEventListener(
      'input',
      debounce(() => this.handleSearchInput(), 500),
    );

    // Enter key handler
    this.searchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.handleSearch();
      }
    });

    // Click outside handler
    document.addEventListener('click', event => {
      if (!this.searchInput.contains(event.target)
                && !this.suggestionsContainer.contains(event.target)) {
        this.hideSuggestions();
      }
    });
  }

  async handleSearchInput() {
    const query = this.searchInput.value.trim();
    if (query.length > 2) {
      stateManager.setState({ searchQuery: query });
      await this.onSearch(query, true); // true indicates this is for suggestions
    } else {
      this.hideSuggestions();
    }
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (query) {
      stateManager.setState({ searchQuery: query });
      await this.onSearch(query, false); // false indicates this is a full search
      this.hideSuggestions();
    }
  }

  displaySuggestions(results) {
    if (!results.length) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsContainer.innerHTML = '';
    this.suggestionsContainer.classList.remove('hidden');

    results.forEach(result => {
      const suggestionItem = this.createSuggestionItem(result);
      this.suggestionsContainer.appendChild(suggestionItem);
    });
  }

  getYearFromResult(result) {
    if (result.release_date) {
      return new Date(result.release_date).getFullYear();
    }
    if (result.first_air_date) {
      return new Date(result.first_air_date).getFullYear();
    }
    return '';
  }

  getRatingElement(result) {
    if (!result.vote_average) {
      return '';
    }
    return `<span class="suggestion-rating">★ ${result.vote_average.toFixed(1)}</span>`;
  }

  getPosterElement(result, title) {
    if (!result.poster_path) {
      return '<div class="suggestion-poster-placeholder"></div>';
    }
    return `<img src="https://image.tmdb.org/t/p/w92${result.poster_path}" 
                 alt="${title}" 
                 class="suggestion-poster">`;
  }

  createSuggestionItem(result) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const title = result.title || result.name;
    const year = this.getYearFromResult(result);
    const rating = this.getRatingElement(result);
    const poster = this.getPosterElement(result, title);

    item.innerHTML = `
            <div class="flex items-center">
                ${poster}
                <div class="suggestion-content">
                    <div class="suggestion-title">${title}</div>
                    <div class="suggestion-details">
                        <span class="suggestion-year">${year}</span>
                        ${rating}
                    </div>
                </div>
            </div>
        `;

    item.addEventListener('click', () => {
      this.onSuggestionSelect(result);
      this.searchInput.value = title;
      this.hideSuggestions();
    });

    return item;
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.classList.add('hidden');
    }
  }

  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.hideSuggestions();
  }
}

export default SearchBar;
