import { generateImageUrl } from './mediaUtils.js';

export const episodePlaceholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-film">
  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
  <line x1="7" y1="2" x2="7" y2="22"></line>
  <line x1="17" y1="2" x2="17" y2="22"></line>
  <line x1="2" y1="12" x2="22" y2="12"></line>
  <line x1="2" y1="7" x2="7" y2="7"></line>
  <line x1="2" y1="17" x2="7" y2="17"></line>
  <line x1="17" y1="17" x2="22" y2="17"></line>
  <line x1="17" y1="7" x2="22" y2="7"></line>
</svg>`;

export const generateCastList = credits => credits.cast
  ?.slice(0, 5)
  .map(
    actor => `
  <div class="cast-item">
    <div class="cast-avatar">
      <img src="${
  actor.profile_path
    ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
    : 'src/assets/placeholder.png'
}" 
           alt="${actor.name}"
           loading="lazy">
    </div>
    <div class="cast-name">${actor.name}</div>
    <div class="cast-character">${actor.character}</div>
  </div>
`,
  )
  .join('') || '';

export const generateSeasonSelector = (seasons, episodes) => {
  const storedData = JSON.parse(localStorage.getItem('vidLinkProgress') || '{}');
  const currentSeasonNumber = seasons[0]?.season_number;

  return `
    <div class="seasons-list">
      <h3 class="text-2xl font-bold text-purple-300 p-4 border-b border-purple-700">Seasons</h3>
      ${seasons.map(season => {
    const episodesWatched = 0;
    const progressPercentage = (episodesWatched / (season.episode_count || 1)) * 100;
    
    return `
          <div class="season-item ${season.season_number === currentSeasonNumber ? 'selected' : ''}" 
               data-season-number="${season.season_number}">
            <img src="${season.poster_path ? generateImageUrl(season.poster_path, 'w200') : 'src/assets/placeholder.png'}"
                 alt="Season ${season.season_number}"
                 class="season-poster"
                 loading="lazy">
            <div class="season-info">
              <div class="season-title">Season ${season.season_number}</div>
              <div class="episode-count">${season.episode_count} Episodes</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              </div>
            </div>
          </div>`;
  }).join('')}
    </div>

    <div class="episodes-container">
      <h2 class="text-2xl font-bold text-purple-300 mb-6">Select Episode</h2>
      <input type="text" 
             class="episode-search" 
             placeholder="Search episodes..."
             id="episodeSearchInput">
      
      <div class="episodes-grid">
        ${episodes.map(episode => {
    const episodeKey = `s${currentSeasonNumber}e${episode.episode_number}`;
    const episodeProgress = storedData[episodeKey]?.progress || { watched: 0, duration: 0 };
    const progressPercentage = episodeProgress.duration > 0 
      ? (episodeProgress.watched / episodeProgress.duration) * 100 
      : 0;

    return `
            <div class="episode-card" data-episode="${episode.episode_number}">
              <div class="relative">
                ${episode.still_path 
      ? `<img src="${generateImageUrl(episode.still_path, 'w780')}"
                       alt="Episode ${episode.episode_number}"
                       class="episode-thumbnail"
                       loading="lazy">`
      : `<div class="episode-thumbnail no-image">${episodePlaceholderSvg}</div>`
    }
                <div class="episode-progress">
                  <div class="episode-progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
              </div>
              <div class="episode-info">
                <div class="episode-number">Episode ${episode.episode_number}</div>
                <div class="episode-title">${episode.name}</div>
                <div class="episode-overview">${episode.overview || 'No description available.'}</div>
              </div>
            </div>`;
  }).join('')}
      </div>
    </div>

    <button class="close-modal">
      <i class="fas fa-times"></i>
    </button>`;
};

export const generateMainTemplate = (
  details,
  mediaType,
  posterUrl,
  trailerButton,
  rating,
  runtime,
  popularity,
  genres,
  language,
  releaseDate,
  castList,
  providerSelectionHtml,
  languageOptions,
) => `
  <div class="media-details">
    <div class="flex gap-6">
      <div class="media-left-column">
        <div class="media-poster-large">
          <img src="${posterUrl}" 
               alt="${details.title || details.name}"
               class="rounded-lg shadow-lg"
               loading="lazy"
               onerror="this.onerror=null; this.src='src/assets/placeholder.png';">
          ${trailerButton}
          ${mediaType === 'tv'
    ? `
            <button id="selectEpisodeButton" class="action-button watch-button">
              <i class="fas fa-list"></i>
              Select Episode
            </button>
          `
    : ''
}
        </div>
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
          ${mediaType === 'movie'
    ? `
            <div class="metadata-item">
              <span class="metadata-label">Budget</span>
              <span class="metadata-value">$${details.budget?.toLocaleString() || 'N/A'}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Revenue</span>
              <span class="metadata-value">$${details.revenue?.toLocaleString() || 'N/A'}</span>
            </div>
          `
    : ''
}
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

        <div id="videoPlayer" class="hidden"></div>
      </div>
    </div>
  </div>

  <!-- Episode Modal -->
  <div id="episodeModal" class="episode-modal">
    <div class="episode-modal-content">
      ${mediaType === 'tv' ? generateSeasonSelector([], []) : ''}
    </div>
  </div>
`;
