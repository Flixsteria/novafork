import { generateImageUrl } from '../../services/utils/media/mediaUtils.js';
import releaseTypeService from '../../services/utils/search/releaseTypeService.js';

class MediaCard {
  constructor(media, genreMap = {}) {
    this.media = media;
    this.genreMap = genreMap;
  }

  getGenreNames() {
    if (!this.media.genre_ids) return [];
    return this.media.genre_ids
      .map(id => this.genreMap[id] || 'Unknown')
      .slice(0, 3);
  }

  getSourceTypeBadge(releaseType) {
    if (!releaseType) return '';

    const badges = {
      CAM: '<span class="source-type source-type-cam"><i class="fas fa-video"></i> CAM</span>',
      HD: '<span class="source-type source-type-hd"><i class="fas fa-film"></i> HD</span>',
      'Not Released': '<span class="source-type source-type-upcoming"><i class="fas fa-clock"></i> Coming Soon</span>',
      Theatrical: '<span class="source-type source-type-hd"><i class="fas fa-film"></i> HD</span>',
      Digital: '<span class="source-type source-type-hd"><i class="fas fa-desktop"></i> HD</span>',
      Physical: '<span class="source-type source-type-hd"><i class="fas fa-compact-disc"></i> HD</span>',
      TV: '<span class="source-type source-type-hd"><i class="fas fa-tv"></i> HD</span>',
    };

    return badges[releaseType] || '';
  }

  async createMediaCard() {
    try {
      const container = document.createElement('div');
      container.className = 'media-card';

      const mediaType = this.media.media_type || (this.media.title ? 'movie' : 'tv');
      const title = this.media.title || this.media.name || 'Untitled';
      const releaseDate = this.media.release_date || this.media.first_air_date;
      const rating = this.media.vote_average ? this.media.vote_average.toFixed(1) : 'N/A';
      const popularity = this.media.popularity ? Math.round(this.media.popularity) : 'N/A';
      const posterPath = this.media.poster_path;
      const posterUrl = posterPath ? generateImageUrl(posterPath, 'w500') : 'src/assets/placeholder.png';
      const genres = this.getGenreNames();

      // Get release type and certification
      const { releaseType, certifications } = await releaseTypeService.getReleaseType(
        this.media.id,
        mediaType,
      );

      const certification = certifications.US || '';
      const sourceTypeBadge = this.getSourceTypeBadge(releaseType);

      container.innerHTML = `
                <div class="media-poster">
                    <img src="${posterUrl}" 
                         alt="${title}" 
                         class="media-image"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='src/assets/placeholder.png';">
                    
                    <div class="media-type-badge">
                        <i class="fas ${mediaType === 'tv' ? 'fa-tv' : 'fa-film'}"></i>
                        ${mediaType === 'tv' ? 'TV' : 'Movie'}
                    </div>

                    ${releaseDate ? `
                        <div class="media-release-date">
                            ${new Date(releaseDate).getFullYear()}
                        </div>
                    ` : ''}

                    <div class="media-info">
                        <h3 class="media-title">${title}</h3>
                        
                        <div class="media-meta">
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                ${rating}/10
                            </div>
                            ${certification ? `
                                <div>
                                    <i class="fas fa-certificate"></i>
                                    ${certification}
                                </div>
                            ` : ''}
                            <div>
                                <i class="fas fa-fire"></i>
                                ${popularity}
                            </div>
                        </div>

                        ${sourceTypeBadge ? `
                            <div class="media-source-type">
                                ${sourceTypeBadge}
                            </div>
                        ` : ''}

                        ${genres.length > 0 ? `
                            <div class="media-genres">
                                ${genres.map(genre => `
                                    <span class="genre-tag">${genre}</span>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${this.media.overview ? `
                            <div class="media-overview">
                                ${this.media.overview}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

      return container;
    } catch (error) {
      console.error('Error creating media card:', error);
      return null;
    }
  }

  async addClickHandler(callback) {
    try {
      const card = await this.createMediaCard();
      if (card) {
        card.addEventListener('click', () => callback(this.media));
      }
      return card;
    } catch (error) {
      console.error('Error adding click handler:', error);
      return null;
    }
  }
}

export default MediaCard;
