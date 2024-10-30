import urlService from '../navigation/urlService.js';
import videoProviders from '../../api/videoProviders.js';
import { generateImageUrl } from './mediaUtils.js';

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
        const [details, credits, videos, translations] = await Promise.all([
          app.tmdbService.getMediaDetails(media.id, mediaType),
          app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/credits`),
          app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/videos`),
          app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/translations`),
        ]);

        const selectedMediaSection = document.getElementById('selectedMediaSection');
        const selectedMovie = document.getElementById('selectedMovie');

        if (!selectedMediaSection || !selectedMovie) {
          throw new Error('Required DOM elements not found');
        }

        selectedMediaSection.classList.remove('hidden');

        const genres = details.genres?.map(genre => genre.name).join(', ') || 'Unknown Genre';
        const language = details.original_language?.toUpperCase() || 'Unknown';
        const releaseDate = details.release_date || details.first_air_date || 'Unknown Release Date';
        const runtime = mediaType === 'movie'
          ? `${details.runtime || 'N/A'} min`
          : `${Math.round((details.episode_run_time || [0])[0])} min per episode`;
        const rating = details.vote_average?.toFixed(1) || 'N/A';
        const popularity = Math.round(details.popularity) || 'N/A';
        const posterUrl = details.poster_path ? generateImageUrl(details.poster_path, 'w500') : 'src/assets/placeholder.png';

        // Get available languages from translations
        const availableLanguages = translations.translations.map(trans => ({
          iso_639_1: trans.iso_639_1,
          name: new Intl.DisplayNames([trans.iso_639_1], { type: 'language' }).of(trans.iso_639_1),
          english_name: trans.english_name,
        }));

        // Sort languages alphabetically by their native names
        availableLanguages.sort((a, b) => a.name.localeCompare(b.name));

        // Add original language at the top if not already included
        if (details.original_language && !availableLanguages.find(lang => lang.iso_639_1 === details.original_language)) {
          availableLanguages.unshift({
            iso_639_1: details.original_language,
            name: new Intl.DisplayNames([details.original_language], { type: 'language' }).of(details.original_language),
            english_name: new Intl.DisplayNames(['en'], { type: 'language' }).of(details.original_language),
          });
        }

        const languageOptions = availableLanguages.map(lang => `<option value="${lang.iso_639_1}" ${lang.iso_639_1 === details.original_language ? 'selected' : ''}>${lang.name} (${lang.english_name})</option>`).join('');

        const castList = credits.cast?.slice(0, 5).map(actor => `
                <div class="cast-item">
                    <div class="cast-avatar">
                        <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'src/assets/placeholder.png'}" 
                             alt="${actor.name}"
                             loading="lazy">
                    </div>
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character}</div>
                </div>
            `).join('') || '';

        // Get provider groups and generate provider selection HTML
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

        // Get trailer
        const trailer = videos.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube') || videos.results?.[0];
        const trailerButton = trailer ? `
            <button id="trailerButton" class="trailer-button">
                <i class="fas fa-play"></i>
                Watch Trailer
            </button>
        ` : '';

        selectedMovie.innerHTML = `
                <div class="media-details">
                    <div class="flex gap-6">
                        <div class="media-poster-large">
                            <img src="${posterUrl}" 
                                 alt="${details.title || details.name}"
                                 class="rounded-lg shadow-lg"
                                 loading="lazy"
                                 onerror="this.onerror=null; this.src='src/assets/placeholder.png';">
                            ${trailerButton}
                        </div>
                        <div class="media-content flex-1">
                            <div class="media-header">
                                <h1 class="media-title">${details.title || details.name}</h1>
                                <div class="media-year">${new Date(releaseDate).getFullYear()}</div>
                            </div>

                            <div class="media-stats">
                                <div class="media-stat">
                                    <i class="fas ${mediaType === 'tv' ? 'fa-tv' : 'fa-film'}"></i>
                                    <span>${mediaType === 'tv' ? 'TV Show' : 'Movie'}</span>
                                </div>
                                <div class="media-stat">
                                    <i class="fas fa-star"></i>
                                    <span>${rating}/10</span>
                                </div>
                                <div class="media-stat">
                                    <i class="fas fa-clock"></i>
                                    <span>${runtime}</span>
                                </div>
                                <div class="media-stat">
                                    <i class="fas fa-fire"></i>
                                    <span>${popularity}</span>
                                </div>
                            </div>

                            <div class="media-overview">${details.overview}</div>

                            <div class="media-metadata">
                                <div class="metadata-item">
                                    <span class="metadata-label">Genre</span>
                                    <span class="metadata-value">${genres}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Language</span>
                                    <span class="metadata-value">${language}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Release Date</span>
                                    <span class="metadata-value">${new Date(releaseDate).toLocaleDateString()}</span>
                                </div>
                                ${mediaType === 'movie' ? `
                                    <div class="metadata-item">
                                        <span class="metadata-label">Budget</span>
                                        <span class="metadata-value">$${details.budget?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <span class="metadata-label">Revenue</span>
                                        <span class="metadata-value">$${details.revenue?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="media-cast">
                                <h3 class="cast-label">Cast</h3>
                                <div class="cast-list">
                                    ${castList}
                                </div>
                            </div>

                            <div class="selectors-container">
                                <div class="provider-selection">
                                    <label for="providerSelect" class="selector-label">
                                        <i class="fas fa-play-circle"></i>
                                        Select Provider
                                    </label>
                                    <select id="providerSelect" class="selector-input">
                                        ${providerSelectionHtml}
                                    </select>
                                </div>

                                <div class="language-selection">
                                    <label for="languageSelect" class="selector-label">
                                        <i class="fas fa-language"></i>
                                        Select Language
                                    </label>
                                    <select id="languageSelect" class="selector-input">
                                        ${languageOptions}
                                    </select>
                                </div>
                            </div>

                            <div class="media-actions">
                                <button id="playButton" class="action-button watch-button">
                                    <i class="fas fa-play"></i>
                                    Watch Now
                                </button>
                                <button id="shareButton" class="action-button share-button">
                                    <i class="fas fa-share"></i>
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="videoPlayer" class="hidden"></div>
                </div>
            `;

        const playButton = document.getElementById('playButton');
        const shareButton = document.getElementById('shareButton');
        const videoPlayer = document.getElementById('videoPlayer');
        const providerSelect = document.getElementById('providerSelect');
        const languageSelect = document.getElementById('languageSelect');
        const trailerBtn = document.getElementById('trailerButton');

        if (playButton) {
          playButton.addEventListener('click', async () => {
            try {
              if (videoPlayer) {
                videoPlayer.classList.remove('hidden');
                await app.mediaPlayer.play(media);
              }
            } catch (error) {
              console.error('Failed to load video:', error);
              app.showError('Failed to load video content');
            }
          });
        }

        if (shareButton) {
          shareButton.addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.searchParams.set('mediaId', media.id);
            url.searchParams.set('mediaType', mediaType);
            const shareText = `Check out ${details.title || details.name} on Novafork!`;

            if (navigator.share) {
              navigator.share({
                title: details.title || details.name,
                text: shareText,
                url: url.toString(),
              }).catch(error => {
                console.error('Error sharing:', error);
                app.showError('Failed to share content');
              });
            } else {
              navigator.clipboard.writeText(url.toString())
                .then(() => app.showError('Link copied to clipboard!'))
                .catch(() => app.showError('Failed to copy link'));
            }
          });
        }

        if (providerSelect) {
          providerSelect.addEventListener('change', e => {
            app.mediaPlayer.currentProvider = e.target.value;
            if (videoPlayer && !videoPlayer.classList.contains('hidden')) {
              app.mediaPlayer.play(media);
            }
          });
        }

        if (languageSelect) {
          languageSelect.addEventListener('change', e => {
            localStorage.setItem('preferredLanguage', e.target.value);
          });
        }

        if (trailerBtn && trailer) {
          trailerBtn.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'trailer-modal';
            modal.innerHTML = `
                <div class="trailer-modal-content">
                    <button class="close-trailer">
                        <i class="fas fa-times"></i>
                    </button>
                    <iframe 
                        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.close-trailer');
            closeBtn.addEventListener('click', () => {
              document.body.removeChild(modal);
            });

            modal.addEventListener('click', e => {
              if (e.target === modal) {
                document.body.removeChild(modal);
              }
            });
          });
        }

        urlService.updateUrl(media.id, mediaType, details.title || details.name);
        selectedMediaSection.scrollIntoView({ behavior: 'smooth' });

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
