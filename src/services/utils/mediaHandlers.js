import urlService from './urlService.js';
import videoProviders from '../api/videoProviders.js';

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
        const [details, credits] = await Promise.all([
          app.tmdbService.getMediaDetails(media.id, mediaType),
          app.tmdbService.fetchFromAPI(`/${mediaType}/${media.id}/credits`),
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

        selectedMovie.innerHTML = `
                <div class="media-details">
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

                    <div class="provider-selection">
                        <select id="providerSelect" class="provider-select">
                            ${providerSelectionHtml}
                        </select>
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

                    <div id="videoPlayer" class="hidden"></div>
                </div>
            `;

        const playButton = document.getElementById('playButton');
        const shareButton = document.getElementById('shareButton');
        const videoPlayer = document.getElementById('videoPlayer');
        const providerSelect = document.getElementById('providerSelect');

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
