class UrlService {
  constructor() {
    this.setupHistoryListener();
  }

  setupHistoryListener() {
    window.addEventListener('popstate', event => {
      if (event.state) {
        const { mediaId, mediaType, title } = event.state;
        this.loadMediaFromUrlParams(mediaId, mediaType, title);
      }
    });
  }

  async loadMediaFromUrlParams(mediaId, mediaType, title, apiKey) {
    const urlParams = new URLSearchParams(window.location.search);
    mediaType = mediaType || urlParams.get('mediaType');
    mediaId = mediaId || urlParams.get('mediaId');
    title = title || urlParams.get('title');

    if (mediaType && mediaId) {
      return { mediaType, mediaId };
    } if (title) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`,
        );
        const data = await response.json();
        const media = data.results.find(item => (item.title && item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === title)
                    || (item.name && item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === title));

        if (media) {
          const foundMediaType = media.media_type || (media.title ? 'movie' : 'tv');
          return { mediaType: foundMediaType, mediaId: media.id };
        }
      } catch (error) {
        console.error('Failed to load media from title:', error);
      }
    }
    return null;
  }

  updateUrl(mediaId, mediaType, title) {
    const newUrl = `${window.location.origin}${window.location.pathname}?mediaType=${encodeURIComponent(mediaType)}&mediaId=${encodeURIComponent(mediaId)}`;
    window.history.pushState({ mediaId, mediaType, title }, '', newUrl);
  }
}

export default new UrlService();
