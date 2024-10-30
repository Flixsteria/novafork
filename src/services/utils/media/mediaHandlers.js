import urlService from '../navigation/urlService.js';
import {
  fetchMediaDetails,
  fetchSeasonData,
  processMediaData,
  setupMediaView,
} from './mediaDetails.js';

const handleMediaSelect = function handleMediaSelect(media) {
  const app = this;

  if (!app.tmdbService) {
    console.error('TMDBService not initialized');
    return;
  }

  return new Promise((resolve, reject) => {
    const setupMedia = async () => {
      try {
        const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

        // Fetch all required data
        const {
          details,
          credits,
          videos,
          translations,
        } = await fetchMediaDetails(app, media);

        const { seasons, episodes } = await fetchSeasonData(app, media, details);

        // Process media data
        const processedData = processMediaData(details, translations);

        // Setup the view with all data
        setupMediaView(
          app,
          media,
          mediaType,
          details,
          processedData,
          credits,
          videos,
          seasons,
          episodes,
        );

        // Update URL and scroll into view
        urlService.updateUrl(media.id, mediaType, details.title || details.name);
        document.getElementById('selectedMediaSection')?.scrollIntoView({ behavior: 'smooth' });

        resolve();
      } catch (error) {
        console.error('Failed to fetch media details:', error);
        app.showError('Failed to load media details');
        reject(error);
      }
    };

    setupMedia();
  });
};

export default handleMediaSelect;
