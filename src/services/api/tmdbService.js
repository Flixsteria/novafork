class TMDBService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  async fetchFromAPI(endpoint, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        ...params,
      });
      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async getPopularMedia(type = 'movie', page = 1) {
    return this.fetchFromAPI(`/trending/${type}/week`, { page });
  }

  async searchMedia(query, type = 'movie', page = 1) {
    return this.fetchFromAPI(`/search/${type}`, { query, page });
  }

  async getMediaDetails(id, type) {
    return this.fetchFromAPI(`/${type}/${id}`);
  }

  async getMediaTrailer(id, type) {
    const response = await this.fetchFromAPI(`/${type}/${id}/videos`);
    return response.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  }

  async getGenres(type = 'movie') {
    const endpoint = type === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
    const response = await this.fetchFromAPI(endpoint);
    return response.genres;
  }

  async searchActors(query) {
    return this.fetchFromAPI('/search/person', { query });
  }

  async getActorMedia(actorId, type = 'movie', page = 1) {
    return this.fetchFromAPI(`/discover/${type}`, {
      with_cast: actorId,
      page,
    });
  }

  async searchCompanies(query) {
    return this.fetchFromAPI('/search/company', { query });
  }

  async getCompanyMedia(companyId, type = 'movie', page = 1) {
    return this.fetchFromAPI(`/discover/${type}`, {
      with_companies: companyId,
      page,
    });
  }

  async getCollection(collectionId) {
    return this.fetchFromAPI(`/collection/${collectionId}`);
  }

  async getReleaseInfo(id, type) {
    return this.fetchFromAPI(`/${type}/${id}/release_dates`);
  }

  async getWatchProviders(id, type) {
    return this.fetchFromAPI(`/${type}/${id}/watch/providers`);
  }
}

export default TMDBService;
