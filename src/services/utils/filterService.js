class FilterService {
  constructor() {
    this.setupEventListeners();
    this.setupTypeSelect();
    this.applyInitialStyles();
  }

  setupEventListeners() {
    const categorySelect = document.getElementById('categorySelect');
    const typeSelect = document.getElementById('typeSelect');
    const toggleButton = document.getElementById('toggleFiltersButton');
    const additionalFilters = document.getElementById('additionalFilters');

    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.handleFilterChange());
      // Ensure styles are applied after browser autofill
      categorySelect.addEventListener('input', () => this.applySelectStyles(categorySelect));
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', async () => {
        // Update genres when media type changes
        const tmdbService = window.app?.tmdbService;
        if (tmdbService) {
          const type = typeSelect.value === 'all' ? 'movie' : typeSelect.value;
          const genres = await tmdbService.getGenres(type);
          this.updateGenreSelect(genres);
        }
        this.handleFilterChange();
      });
    }

    if (toggleButton && additionalFilters) {
      // Restore advanced filters state
      const isExpanded = localStorage.getItem('advancedFiltersExpanded') === 'true';
      if (isExpanded) {
        additionalFilters.classList.remove('hidden');
        additionalFilters.classList.add('show');
        toggleButton.classList.add('active');
        const toggleIcon = document.getElementById('toggleIconPath');
        if (toggleIcon) {
          toggleIcon.setAttribute('d', 'M19 15l-7-7-7 7');
        }
      }

      // Handle suggestions visibility
      const inputs = additionalFilters.querySelectorAll('input');
      inputs.forEach(input => {
        const suggestionsId = input.id.replace('Input', 'Suggestions');
        const suggestions = document.getElementById(suggestionsId);
        if (suggestions) {
          input.addEventListener('focus', () => {
            suggestions.classList.add('show');
          });
          input.addEventListener('blur', () => {
            // Delay hiding to allow clicking suggestions
            setTimeout(() => {
              suggestions.classList.remove('show');
            }, 200);
          });
        }
      });
    }

    // Re-apply styles after dynamic updates
    document.addEventListener('DOMContentLoaded', () => {
      this.applyInitialStyles();
      this.restoreFilters();
    });
  }

  setupTypeSelect() {
    const typeSelect = document.getElementById('typeSelect');
    if (!typeSelect) return;

    // Set initial value if not already set
    if (!typeSelect.value) {
      const savedType = localStorage.getItem('selectedMediaType') || 'movie';
      typeSelect.value = savedType;
    }

    // Save type selection to localStorage
    typeSelect.addEventListener('change', () => {
      localStorage.setItem('selectedMediaType', typeSelect.value);
    });
  }

  applyInitialStyles() {
    const categorySelect = document.getElementById('categorySelect');
    const typeSelect = document.getElementById('typeSelect');

    if (categorySelect) {
      categorySelect.classList.add('custom-select');
      this.ensureParentContainer(categorySelect);
    }

    if (typeSelect) {
      typeSelect.classList.add('custom-select');
      this.ensureParentContainer(typeSelect);
    }
  }

  ensureParentContainer(element) {
    let parent = element.closest('.filter-container');
    if (!parent) {
      parent = element.parentElement;
      if (parent) {
        parent.classList.add('filter-container');
      }
    }
  }

  handleFilterChange() {
    const event = new CustomEvent('filterChange');
    document.dispatchEvent(event);

    // Save current filters
    this.saveFilters();
  }

  getSelectedFilters() {
    const categorySelect = document.getElementById('categorySelect');
    const typeSelect = document.getElementById('typeSelect');
    const actorInput = document.getElementById('actorSearchInput');
    const companyInput = document.getElementById('companySearchInput');
    const collectionInput = document.getElementById('collectionSearchInput');
    const franchiseInput = document.getElementById('franchiseSearchInput');

    const type = typeSelect?.value || 'movie';

    return {
      category: categorySelect?.value || '',
      type: type === 'all' ? ['movie', 'tv'] : type,
      actor: actorInput?.value || '',
      company: companyInput?.value || '',
      collection: collectionInput?.value || '',
      franchise: franchiseInput?.value || '',
    };
  }

  saveFilters() {
    const filters = this.getSelectedFilters();
    localStorage.setItem('selectedFilters', JSON.stringify(filters));
  }

  restoreFilters() {
    const savedFilters = localStorage.getItem('selectedFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      const categorySelect = document.getElementById('categorySelect');
      const typeSelect = document.getElementById('typeSelect');
      const actorInput = document.getElementById('actorSearchInput');
      const companyInput = document.getElementById('companySearchInput');
      const collectionInput = document.getElementById('collectionSearchInput');
      const franchiseInput = document.getElementById('franchiseSearchInput');

      if (categorySelect && filters.category) {
        categorySelect.value = filters.category;
      }

      if (typeSelect && filters.type) {
        typeSelect.value = Array.isArray(filters.type) ? 'all' : filters.type;
      }

      if (actorInput && filters.actor) actorInput.value = filters.actor;
      if (companyInput && filters.company) companyInput.value = filters.company;
      if (collectionInput && filters.collection) collectionInput.value = filters.collection;
      if (franchiseInput && filters.franchise) franchiseInput.value = filters.franchise;
    }
  }

  async updateGenreSelect(genres) {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;

    const currentValue = categorySelect.value;
    categorySelect.innerHTML = '<option value="">All Genres</option>';

    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      categorySelect.appendChild(option);
    });

    // Restore selected value if it exists in new genres
    if (currentValue && genres.some(g => g.id.toString() === currentValue)) {
      categorySelect.value = currentValue;
    }

    // Ensure styles are maintained
    categorySelect.classList.add('custom-select');
    this.ensureParentContainer(categorySelect);
  }
}

export default new FilterService();
