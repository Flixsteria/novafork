import { generateImageUrl } from './mediaUtils.js';
import { generateMainTemplate, generateSeasonSelector, generateCastList } from './mediaTemplates.js';
import {
  setupEpisodeHandlers,
  setupPlayHandler,
  setupShareHandler,
  setupTrailerHandler,
  setupProviderHandler,
  setupLanguageHandler,
} from './eventHandlers.js';
import videoProviders from '../../api/videoProviders.js';

export const fetchMediaDetails = async (app, media) => {
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const [details, credits, videos, translations] = await Promise.all([
    app.tmdbService.getMediaDetails(media.id, mediaType),
    app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/credits`),
    app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/videos`),
    app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/translations`),
  ]);

  return {
    details, credits, videos, translations,
  };
};

export const fetchSeasonData = async (app, media, details) => {
  let seasons = [];
  let episodes = [];

  if (details.seasons) {
    seasons = details.seasons.filter(season => season.season_number > 0);
    if (seasons.length > 0) {
      const [currentSeason] = seasons;
      const seasonData = await app.tmdbService.fetchFromAPI(`/tv/${media.id}/season/${currentSeason.season_number}`);
      episodes = seasonData.episodes || [];
    }
  }

  return { seasons, episodes };
};

export const processMediaData = (details, translations) => {
  const genres = details.genres?.map(genre => genre.name).join(', ') || 'Unknown Genre';
  const language = details.original_language?.toUpperCase() || 'Unknown';
  const releaseDate = details.release_date || details.first_air_date || 'Unknown Release Date';
  const runtime = details.runtime
    ? `${details.runtime || 'N/A'} min`
    : `${Math.round((details.episode_run_time || [0])[0])} min per episode`;
  const rating = details.vote_average?.toFixed(1) || 'N/A';
  const popularity = Math.round(details.popularity) || 'N/A';
  const posterUrl = details.poster_path ? generateImageUrl(details.poster_path, 'w500') : 'src/assets/placeholder.png';

  // Process languages
  const availableLanguages = translations.translations.map(trans => ({
    iso_639_1: trans.iso_639_1,
    name: new Intl.DisplayNames([trans.iso_639_1], { type: 'language' }).of(trans.iso_639_1),
    english_name: trans.english_name,
  }));

  availableLanguages.sort((a, b) => a.name.localeCompare(b.name));

  if (details.original_language && !availableLanguages.find(lang => lang.iso_639_1 === details.original_language)) {
    availableLanguages.unshift({
      iso_639_1: details.original_language,
      name: new Intl.DisplayNames([details.original_language], { type: 'language' }).of(details.original_language),
      english_name: new Intl.DisplayNames(['en'], { type: 'language' }).of(details.original_language),
    });
  }

  const languageOptions = availableLanguages.map(lang => `<option value="${lang.iso_639_1}" ${lang.iso_639_1 === details.original_language ? 'selected' : ''}>
      ${lang.name} (${lang.english_name})
    </option>`).join('');

  return {
    genres,
    language,
    releaseDate,
    runtime,
    rating,
    popularity,
    posterUrl,
    languageOptions,
  };
};

export const processProviderData = () => {
  const providerGroups = videoProviders.getProviderGroups();
  const getGroupLabel = groupName => {
    switch (groupName) {
    case 'premium':
      return 'Best Providers (No Ads)';
    case 'standard':
      return 'Alternative Providers (Ads May Appear)';
    case 'anime':
      return 'Anime Providers';
    case 'alternative':
      return 'Additional Providers';
    default:
      return 'Other Providers';
    }
  };

  const providerSelectionHtml = Object.entries(providerGroups)
    .map(([groupName, providers]) => {
      const options = providers
        .map(provider => `<option value="${provider.id}">${provider.name}</option>`)
        .join('');
      return `<optgroup label="${getGroupLabel(groupName)}">${options}</optgroup>`;
    })
    .join('');

  return providerSelectionHtml;
};

export const setupMediaView = (app, media, mediaType, details, processedData, credits, videos, seasons, episodes) => {
  const selectedMediaSection = document.getElementById('selectedMediaSection');
  const selectedMovie = document.getElementById('selectedMovie');

  if (!selectedMediaSection || !selectedMovie) {
    throw new Error('Required DOM elements not found');
  }

  selectedMediaSection.classList.remove('hidden');

  const castList = generateCastList(credits);
  const providerSelectionHtml = processProviderData();
  const trailer = videos.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube') || videos.results?.[0];
  const trailerButton = trailer ? `
    <button id="trailerButton" class="trailer-button">
      <i class="fas fa-play"></i>
      Watch Trailer
    </button>
  ` : '';

  // Generate main template
  selectedMovie.innerHTML = generateMainTemplate(
    details,
    mediaType,
    processedData.posterUrl,
    trailerButton,
    processedData.rating,
    processedData.runtime,
    processedData.popularity,
    processedData.genres,
    processedData.language,
    processedData.releaseDate,
    castList,
    providerSelectionHtml,
    processedData.languageOptions,
  );

  // Update episode modal content if it's a TV show
  if (mediaType === 'tv' && seasons.length > 0) {
    const modalContentDiv = document.querySelector('#episodeModal .episode-modal-content');
    if (modalContentDiv) {
      modalContentDiv.innerHTML = generateSeasonSelector(seasons, episodes);
    }
  }

  // Set up event handlers
  if (mediaType === 'tv') {
    setupEpisodeHandlers(app, media);
  }
  setupPlayHandler(app, media, mediaType);
  setupShareHandler(app, media, mediaType, details);
  setupTrailerHandler(trailer);
  setupProviderHandler(app, media);
  setupLanguageHandler();
};
