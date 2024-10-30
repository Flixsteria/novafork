import { debounce } from '../../services/utils/media/mediaUtils.js';
import stateManager from '../../services/utils/state/stateManager.js';
import MediaGrid from '../media/MediaGrid.js';

class SearchBar {
  constructor(searchInputId, suggestionsId, onSearch, onSuggestionSelect) {
    this.searchInput = document.getElementById(searchInputId);
    this.suggestionsContainer = document.getElementById(suggestionsId);
    this.searchButton = document.getElementById('searchButton');
    this.onSearch = onSearch;
    this.onSuggestionSelect = onSuggestionSelect;
    this.setupEventListeners();
    this.initializeSearchResults();
  }

  initializeSearchResults() {
    // Create search results section if it doesn't exist
    if (!document.getElementById('searchResultsSection')) {
      const searchResultsSection = document.createElement('section');
      searchResultsSection.id = 'searchResultsSection';
      searchResultsSection.className = 'mb-8 sm:mb-12 mt-8 sm:mt-16 hidden';
      searchResultsSection.innerHTML = `
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white neon-text">Search Results</h2>
        <div id="searchResultsGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6 p-4 sm:p-6 glassmorphism rounded-2xl">
        </div>
      `;

      // Insert before the trending section
      const trendingSection = document.querySelector('section');
      if (trendingSection) {
        trendingSection.parentNode.insertBefore(searchResultsSection, trendingSection);
      }

      // Initialize MediaGrid for search results
      this.searchResultsGrid = new MediaGrid('searchResultsGrid', this.onSuggestionSelect);
    }
  }

  setupEventListeners() {
    if (!this.searchInput || !this.suggestionsContainer) {
      return;
    }

    // Search input handler with debounce
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

    // Search button click handler
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => {
        this.handleSearch();
      });
    }

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
      this.hideSearchResults();
    }
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (query) {
      stateManager.setState({
        searchQuery: query,
        currentMediaType: 'search',
        currentPage: 1,
      });
      const results = await this.onSearch(query, false); // false indicates this is a full search
      if (results && results.results) {
        this.searchResultsGrid.displayMedia(results.results);
        this.showSearchResults();
      }
      this.hideSuggestions();
    }
  }

  showSearchResults() {
    const searchResultsSection = document.getElementById('searchResultsSection');
    if (searchResultsSection) {
      searchResultsSection.classList.remove('hidden');
    }
  }

  hideSearchResults() {
    const searchResultsSection = document.getElementById('searchResultsSection');
    if (searchResultsSection) {
      searchResultsSection.classList.add('hidden');
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
    item.className = 'suggestion-item glassmorphism p-2 hover:bg-purple-700/30 transition-all duration-300 cursor-pointer rounded-xl mb-2';

    const title = result.title || result.name;
    const year = this.getYearFromResult(result);
    const rating = this.getRatingElement(result);
    const poster = this.getPosterElement(result, title);

    item.innerHTML = `
      <div class="flex items-center">
        ${poster}
        <div class="suggestion-content ml-3">
          <div class="suggestion-title text-white font-semibold">${title}</div>
          <div class="suggestion-details text-gray-400 text-sm">
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
    this.hideSearchResults();
  }
}

export default SearchBar;
