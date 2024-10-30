import TMDBService from './services/api/tmdbService.js';
import MediaGrid from './components/media/MediaGrid.js';
import SearchBar from './components/search/SearchBar.js';
import FilterPanel from './components/filters/FilterPanel.js';
import stateManager from './services/utils/state/stateManager.js';
import BitcoinModal from './components/modals/BitcoinModal.js';
import DonateModal from './components/modals/DonateModal.js';
import ShareModal from './components/modals/ShareModal.js';
import MediaPlayer from './components/media/MediaPlayer.js';
import LoadingScreen from './components/ui/LoadingScreen.js';
import SearchService from './services/utils/search/searchService.js';
import urlService from './services/utils/navigation/urlService.js';
import releaseTypeService from './services/utils/search/releaseTypeService.js';
import paginationService from './services/utils/navigation/paginationService.js';
import filterService from './services/utils/search/filterService.js';
import AdvancedSearchService from './services/utils/search/advancedSearchService.js';
import handleMediaSelect from './services/utils/media/mediaHandlers.js';

class App {
  constructor() {
    this.handleMediaSelect = handleMediaSelect.bind(this);
    this.isInitialLoad = true;
    this.init();
  }

  async init() {
    try {
      await this.initializeServices();
      this.initializeComponents();
      this.setupEventListeners();

      // Start loading screen and wait for it to complete
      const loadingPromise = LoadingScreen.show();
      await this.loadInitialContent();
      await loadingPromise; // Wait for loading animation to finish

      this.isInitialLoad = false; // Mark initial load as complete
      await this.loadMediaFromUrlParams();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to initialize application');
      LoadingScreen.hide();
    }
  }

  async initializeServices() {
    try {
      const response = await fetch('/src/config/config.json');
      if (!response.ok) throw new Error('Failed to fetch config');
      const config = await response.json();

      this.tmdbService = new TMDBService(config.apiKey);
      this.searchService = new SearchService(config.apiKey);
      this.advancedSearchService = new AdvancedSearchService(
        this.searchService,
        stateManager,
      );
      releaseTypeService.setApiKey(config.apiKey);
      this.apiKey = config.apiKey;

      stateManager.setState({
        currentPage: 1,
        totalPages: 1,
        currentMediaType: 'trending',
        searchQuery: '',
        currentActorId: null,
        currentCompanyId: null,
        currentCollectionId: null,
        currentFranchiseKeywordId: null,
      });
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  initializeComponents() {
    this.bitcoinModal = new BitcoinModal();
    this.donateModal = new DonateModal();
    this.shareModal = new ShareModal();
    this.mediaPlayer = new MediaPlayer('videoPlayer');
    this.mediaGrid = new MediaGrid('popularMedia', media => this.handleMediaSelect(media));
    this.searchBar = new SearchBar(
      'searchInput',
      'searchSuggestions',
      (query, isSuggestion) => this.handleSearch(query, isSuggestion),
      media => this.handleMediaSelect(media),
    );
    this.filterPanel = new FilterPanel({
      categorySelectId: 'categorySelect',
      typeSelectId: 'typeSelect',
      toggleButtonId: 'toggleFiltersButton',
      additionalFiltersId: 'additionalFilters',
      onFilterChange: () => this.handleFilterChange(),
    });
  }

  setupEventListeners() {
    document.addEventListener('pageChange', async e => {
      await this.handlePageChange(e.detail);
    });
    document.addEventListener('filterChange', () => this.handleFilterChange());
    document.addEventListener('mediaUpdate', () => this.fetchAndDisplayMedia());
  }

  async loadInitialContent() {
    try {
      if (!this.tmdbService) {
        throw new Error('TMDBService not initialized');
      }

      // Get both movie and TV genres
      const [movieGenres, tvGenres] = await Promise.all([
        this.tmdbService.getGenres('movie'),
        this.tmdbService.getGenres('tv'),
      ]);

      // Create a map of unique genres
      this.genreMap = {};
      const uniqueGenres = [];
      const seenGenreIds = new Set();

      // Process movie genres
      movieGenres.forEach(genre => {
        if (!seenGenreIds.has(genre.id)) {
          seenGenreIds.add(genre.id);
          uniqueGenres.push(genre);
          this.genreMap[genre.id] = genre.name;
        }
      });

      // Process TV genres
      tvGenres.forEach(genre => {
        if (!seenGenreIds.has(genre.id)) {
          seenGenreIds.add(genre.id);
          uniqueGenres.push(genre);
          this.genreMap[genre.id] = genre.name;
        }
      });

      // Set the genre map for media grid
      this.mediaGrid.setGenreMap(this.genreMap);

      // Update genre select with unique genres
      filterService.updateGenreSelect(uniqueGenres);

      // Get the current type from filter service
      const currentType = filterService.getSelectedFilters().type;

      // Update genres based on current type
      if (currentType === 'tv') {
        filterService.updateGenreSelect(tvGenres);
      } else if (currentType === 'movie') {
        filterService.updateGenreSelect(movieGenres);
      } else {
        // For 'all', use unique genres
        filterService.updateGenreSelect(uniqueGenres);
      }

      await this.fetchAndDisplayMedia();
    } catch (error) {
      console.error('Failed to load initial content:', error);
      this.showError('Failed to load content');
      throw error; // Propagate error to init method
    }
  }

  async loadMediaFromUrlParams() {
    try {
      const mediaInfo = await urlService.loadMediaFromUrlParams(
        null,
        null,
        null,
        this.apiKey,
      );
      if (mediaInfo) {
        await this.handleMediaSelect({
          id: mediaInfo.mediaId,
          media_type: mediaInfo.mediaType,
        });
      }
    } catch (error) {
      console.error('Failed to load media from URL:', error);
      // Don't show error to user as this is not critical
    }
  }

  async fetchAndDisplayMedia() {
    const state = stateManager.getState();

    // Only show loading screen for non-initial loads
    if (!this.isInitialLoad) {
      LoadingScreen.show(2000); // Use shorter duration for subsequent loads
    }

    try {
      let results;
      const filters = filterService.getSelectedFilters();
      const mediaType = Array.isArray(filters.type)
        ? filters.type[0]
        : filters.type;

      switch (state.currentMediaType) {
      case 'search':
        if (Array.isArray(filters.type)) {
          // If searching all content types, merge results from both movie and TV
          const [movieResults, tvResults] = await Promise.all([
            this.searchService.searchMedia(
              state.searchQuery,
              'movie',
              state.currentPage,
              filters.category,
            ),
            this.searchService.searchMedia(
              state.searchQuery,
              'tv',
              state.currentPage,
              filters.category,
            ),
          ]);

          results = {
            results: [
              ...movieResults.results.map(item => ({
                ...item,
                media_type: 'movie',
              })),
              ...tvResults.results.map(item => ({
                ...item,
                media_type: 'tv',
              })),
            ],
            total_pages: Math.max(
              movieResults.total_pages,
              tvResults.total_pages,
            ),
            page: state.currentPage,
          };
        } else {
          results = await this.searchService.searchMedia(
            state.searchQuery,
            mediaType,
            state.currentPage,
            filters.category,
          );
          // Add media_type to results
          results.results = results.results.map(item => ({
            ...item,
            media_type: mediaType,
          }));
        }
        break;

      case 'actor':
        if (state.currentActorId) {
          if (Array.isArray(filters.type)) {
            const [movieResults, tvResults] = await Promise.all([
              this.searchService.getMediaByActor(
                state.currentActorId,
                'movie',
                state.currentPage,
              ),
              this.searchService.getMediaByActor(
                state.currentActorId,
                'tv',
                state.currentPage,
              ),
            ]);
            results = {
              results: [
                ...movieResults.results.map(item => ({
                  ...item,
                  media_type: 'movie',
                })),
                ...tvResults.results.map(item => ({
                  ...item,
                  media_type: 'tv',
                })),
              ],
              total_pages: Math.max(
                movieResults.total_pages,
                tvResults.total_pages,
              ),
              page: state.currentPage,
            };
          } else {
            results = await this.searchService.getMediaByActor(
              state.currentActorId,
              mediaType,
              state.currentPage,
            );
            // Add media_type to results
            results.results = results.results.map(item => ({
              ...item,
              media_type: mediaType,
            }));
          }
        }
        break;

      case 'company':
        if (state.currentCompanyId) {
          if (Array.isArray(filters.type)) {
            const [movieResults, tvResults] = await Promise.all([
              this.searchService.getMediaByCompany(
                state.currentCompanyId,
                'movie',
                state.currentPage,
              ),
              this.searchService.getMediaByCompany(
                state.currentCompanyId,
                'tv',
                state.currentPage,
              ),
            ]);
            results = {
              results: [
                ...movieResults.results.map(item => ({
                  ...item,
                  media_type: 'movie',
                })),
                ...tvResults.results.map(item => ({
                  ...item,
                  media_type: 'tv',
                })),
              ],
              total_pages: Math.max(
                movieResults.total_pages,
                tvResults.total_pages,
              ),
              page: state.currentPage,
            };
          } else {
            results = await this.searchService.getMediaByCompany(
              state.currentCompanyId,
              mediaType,
              state.currentPage,
            );
            // Add media_type to results
            results.results = results.results.map(item => ({
              ...item,
              media_type: mediaType,
            }));
          }
        }
        break;

        // Collection case remains unchanged as it's movie-only
      case 'collection':
        if (state.currentCollectionId) {
          const collection = await this.searchService.getCollectionDetails(
            state.currentCollectionId,
          );
          if (collection.parts) {
            const sortedMovies = collection.parts.sort(
              (a, b) => new Date(a.release_date) - new Date(b.release_date),
            );
            const totalPages = Math.ceil(sortedMovies.length / 12);
            const start = (state.currentPage - 1) * 12;
            const end = start + 12;
            results = {
              results: sortedMovies
                .slice(start, end)
                .map(item => ({ ...item, media_type: 'movie' })),
              total_pages: totalPages,
              page: state.currentPage,
            };
          }
        }
        break;

      case 'franchise':
        if (state.currentFranchiseKeywordId) {
          if (Array.isArray(filters.type)) {
            const [movieResults, tvResults] = await Promise.all([
              this.searchService.getMediaByKeyword(
                state.currentFranchiseKeywordId,
                'movie',
                state.currentPage,
              ),
              this.searchService.getMediaByKeyword(
                state.currentFranchiseKeywordId,
                'tv',
                state.currentPage,
              ),
            ]);
            results = {
              results: [
                ...movieResults.results.map(item => ({
                  ...item,
                  media_type: 'movie',
                })),
                ...tvResults.results.map(item => ({
                  ...item,
                  media_type: 'tv',
                })),
              ],
              total_pages: Math.max(
                movieResults.total_pages,
                tvResults.total_pages,
              ),
              page: state.currentPage,
            };
          } else {
            results = await this.searchService.getMediaByKeyword(
              state.currentFranchiseKeywordId,
              mediaType,
              state.currentPage,
            );
            // Add media_type to results
            results.results = results.results.map(item => ({
              ...item,
              media_type: mediaType,
            }));
          }
        }
        break;

      default:
        if (filters.category) {
          if (Array.isArray(filters.type)) {
            const [movieResults, tvResults] = await Promise.all([
              this.tmdbService.fetchFromAPI('/discover/movie', {
                page: state.currentPage,
                with_genres: filters.category,
              }),
              this.tmdbService.fetchFromAPI('/discover/tv', {
                page: state.currentPage,
                with_genres: filters.category,
              }),
            ]);
            results = {
              results: [
                ...movieResults.results.map(item => ({
                  ...item,
                  media_type: 'movie',
                })),
                ...tvResults.results.map(item => ({
                  ...item,
                  media_type: 'tv',
                })),
              ],
              total_pages: Math.max(
                movieResults.total_pages,
                tvResults.total_pages,
              ),
              page: state.currentPage,
            };
          } else {
            results = await this.tmdbService.fetchFromAPI(
              `/discover/${mediaType}`,
              {
                page: state.currentPage,
                with_genres: filters.category,
              },
            );
            // Add media_type to results
            results.results = results.results.map(item => ({
              ...item,
              media_type: mediaType,
            }));
          }
        } else if (Array.isArray(filters.type)) {
          const [movieResults, tvResults] = await Promise.all([
            this.tmdbService.fetchFromAPI('/trending/movie/week', {
              page: state.currentPage,
            }),
            this.tmdbService.fetchFromAPI('/trending/tv/week', {
              page: state.currentPage,
            }),
          ]);
          results = {
            results: [
              ...movieResults.results.map(item => ({
                ...item,
                media_type: 'movie',
              })),
              ...tvResults.results.map(item => ({
                ...item,
                media_type: 'tv',
              })),
            ],
            total_pages: Math.max(
              movieResults.total_pages,
              tvResults.total_pages,
            ),
            page: state.currentPage,
          };
        } else {
          results = await this.tmdbService.fetchFromAPI(
            `/trending/${mediaType}/week`,
            {
              page: state.currentPage,
            },
          );
          // Add media_type to results
          results.results = results.results.map(item => ({
            ...item,
            media_type: mediaType,
          }));
        }
        break;
      }

      if (results && results.results) {
        const totalPages = results.total_pages || Math.ceil(results.results.length / 12);
        stateManager.setState({
          totalPages,
          currentPage: results.page || state.currentPage,
        });

        await this.mediaGrid.displayMedia(results.results);
        paginationService.updateControls(state.currentPage, totalPages);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      this.showError('Failed to load media content');
    } finally {
      if (!this.isInitialLoad) {
        LoadingScreen.hide();
      }
    }
  }

  async handleSearch(query, isSuggestion) {
    if (!this.tmdbService) return;

    try {
      if (isSuggestion) {
        const results = await this.searchService.searchMedia(query);
        this.searchBar.displaySuggestions(results.results);
      } else {
        stateManager.setState({
          currentMediaType: 'search',
          currentPage: 1,
          searchQuery: query,
        });
        await this.fetchAndDisplayMedia();
      }
    } catch (error) {
      console.error('Search failed:', error);
      this.showError('Search failed');
    }
  }

  async handleFilterChange() {
    stateManager.setState({ currentPage: 1 });
    await this.fetchAndDisplayMedia();
  }

  async handlePageChange(delta) {
    const state = stateManager.getState();
    const newPage = state.currentPage + delta;

    if (newPage > 0 && newPage <= state.totalPages) {
      stateManager.setState({ currentPage: newPage });
      await this.fetchAndDisplayMedia();
    }
  }

  showError(message) {
    console.error(message);
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

let app = null;

function initializeApp() {
  if (!app) {
    app = new App();
  }
  return app;
}

document.addEventListener('DOMContentLoaded', initializeApp);

export default App;
