class SearchService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async searchActor(query) {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
    );
    return response.json();
  }

  async searchCompany(query) {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/company?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
    );
    return response.json();
  }

  async searchCollection(query) {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/collection?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
    );
    return response.json();
  }

  async searchKeyword(query) {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/keyword?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
    );
    return response.json();
  }

  async searchMedia(query, type = 'movie', page = 1, withGenres = '') {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&with_genres=${withGenres}&page=${page}`,
    );
    return response.json();
  }

  async getMediaByActor(actorId, type = 'movie', page = 1) {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${this.apiKey}&with_cast=${actorId}&page=${page}`,
    );
    return response.json();
  }

  async getMediaByCompany(companyId, type = 'movie', page = 1) {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${this.apiKey}&with_companies=${companyId}&page=${page}`,
    );
    return response.json();
  }

  async getCollectionDetails(collectionId) {
    const response = await fetch(
      `https://api.themoviedb.org/3/collection/${collectionId}?api_key=${this.apiKey}`,
    );
    return response.json();
  }

  async getMediaByKeyword(keywordId, type = 'movie', page = 1) {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${this.apiKey}&with_keywords=${keywordId}&page=${page}`,
    );
    return response.json();
  }
}

export default SearchService;
