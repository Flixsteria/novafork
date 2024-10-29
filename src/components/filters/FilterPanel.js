class FilterPanel {
  constructor(options) {
    this.options = options;
    this.init();
  }

  init() {
    this.categorySelect = document.getElementById(this.options.categorySelectId);
    this.typeSelect = document.getElementById(this.options.typeSelectId);
    this.toggleButton = document.getElementById(this.options.toggleButtonId);
    this.additionalFilters = document.getElementById(this.options.additionalFiltersId);

    if (this.categorySelect) {
      this.initializeSelect(this.categorySelect);
    }

    if (this.typeSelect) {
      this.initializeSelect(this.typeSelect);
      // Set initial value to ensure proper styling
      if (!this.typeSelect.value) {
        this.typeSelect.value = 'movie';
      }
    }

    if (this.toggleButton && this.additionalFilters) {
      this.initializeToggle();
    }

    // Apply initial styles
    this.applyStyles();

    // Re-apply styles after a short delay to handle browser autofill
    setTimeout(() => this.applyStyles(), 100);

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());

    // Handle page load and dynamic updates
    window.addEventListener('load', () => {
      this.applyStyles();
      this.restoreAdvancedFiltersState();
    });
  }

  initializeSelect(select) {
    // Add required classes
    select.classList.add('custom-select');
    const parentContainer = select.closest('.filter-container') || select.parentElement;
    if (parentContainer) {
      parentContainer.classList.add('filter-container');
    }

    // Handle change events
    select.addEventListener('change', () => {
      this.applySelectStyles(select);
      if (this.options.onFilterChange) {
        this.options.onFilterChange();
      }
    });

    // Handle focus/blur events
    select.addEventListener('focus', () => {
      select.classList.add('focused');
      this.applySelectStyles(select, true);
    });

    select.addEventListener('blur', () => {
      select.classList.remove('focused');
      this.applySelectStyles(select);
    });
  }

  initializeToggle() {
    // Add required classes
    this.toggleButton.classList.add('filter-toggle');

    // Restore state from localStorage
    const isExpanded = localStorage.getItem('advancedFiltersExpanded') === 'true';
    if (isExpanded) {
      this.expandAdvancedFilters();
    } else {
      this.collapseAdvancedFilters();
    }

    this.toggleButton.addEventListener('click', () => {
      if (this.additionalFilters.classList.contains('hidden')) {
        this.expandAdvancedFilters();
        localStorage.setItem('advancedFiltersExpanded', 'true');
      } else {
        this.collapseAdvancedFilters();
        localStorage.setItem('advancedFiltersExpanded', 'false');
      }
    });
  }

  expandAdvancedFilters() {
    this.additionalFilters.classList.remove('hidden');
    // Use requestAnimationFrame to ensure the transition works
    requestAnimationFrame(() => {
      this.additionalFilters.classList.add('show');
      this.toggleButton.classList.add('active');
      const toggleIcon = document.getElementById('toggleIconPath');
      if (toggleIcon) {
        toggleIcon.setAttribute('d', 'M19 15l-7-7-7 7');
      }
    });
  }

  collapseAdvancedFilters() {
    this.additionalFilters.classList.remove('show');
    this.toggleButton.classList.remove('active');
    const toggleIcon = document.getElementById('toggleIconPath');
    if (toggleIcon) {
      toggleIcon.setAttribute('d', 'M19 9l-7 7-7-7');
    }

    // Add hidden class after transition
    const handleTransitionEnd = () => {
      if (!this.additionalFilters.classList.contains('show')) {
        this.additionalFilters.classList.add('hidden');
      }
      this.additionalFilters.removeEventListener('transitionend', handleTransitionEnd);
    };

    this.additionalFilters.addEventListener('transitionend', handleTransitionEnd);
  }

  restoreAdvancedFiltersState() {
    if (!this.toggleButton || !this.additionalFilters) return;

    const isExpanded = localStorage.getItem('advancedFiltersExpanded') === 'true';
    if (isExpanded) {
      this.expandAdvancedFilters();
    } else {
      this.collapseAdvancedFilters();
    }
  }

  applyStyles() {
    if (this.categorySelect) {
      this.applySelectStyles(this.categorySelect);
    }
    if (this.typeSelect) {
      this.applySelectStyles(this.typeSelect);
    }
  }

  applySelectStyles(select, isFocused = false) {
    const baseStyles = {
      appearance: 'none',
      '-webkit-appearance': 'none',
      '-moz-appearance': 'none',
      background: 'rgba(31, 41, 55, 0.7)',
      border: '1px solid rgba(76, 0, 255, 0.3)',
      borderRadius: '0.75rem',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.95rem',
      padding: '0.75rem 2.5rem 0.75rem 2.75rem',
      transition: 'all 0.3s ease',
      minWidth: '180px',
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
    };

    const focusStyles = {
      outline: 'none',
      borderColor: 'rgba(76, 0, 255, 0.8)',
      boxShadow: '0 0 0 3px rgba(76, 0, 255, 0.2), 0 0 20px rgba(76, 0, 255, 0.3)',
    };

    Object.assign(select.style, baseStyles);

    if (isFocused) {
      Object.assign(select.style, focusStyles);
    }
  }

  handleResize() {
    this.applyStyles();
  }
}

export default FilterPanel;
