import { episodePlaceholderSvg } from './mediaTemplates.js';
import videoProviders from '../../api/videoProviders.js';

const attachEpisodeClickHandlers = app => {
  document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => {
      const episodeNumber = parseInt(card.dataset.episode, 10);
      document.querySelectorAll('.episode-card').forEach(c => {
        c.classList.remove('selected');
      });
      card.classList.add('selected');
      app.selectedEpisodeNumber = episodeNumber;

      const selectEpisodeButton = document.getElementById(
        'selectEpisodeButton',
      );
      const episodeTitle = card.querySelector('.episode-title').textContent;
      const seasonNumber = document.querySelector('.season-item.selected')
        ?.dataset.seasonNumber;
      if (selectEpisodeButton && seasonNumber) {
        selectEpisodeButton.innerHTML = `
          <i class='fas fa-list'></i>
          S${seasonNumber}E${episodeNumber}: ${episodeTitle}
        `;
      }

      const episodeModal = document.getElementById('episodeModal');
      if (episodeModal) {
        episodeModal.classList.remove('active');
      }
    });
  });
};

export const setupEpisodeHandlers = (app, media) => {
  const selectEpisodeButton = document.getElementById('selectEpisodeButton');
  const episodeModal = document.getElementById('episodeModal');

  if (!selectEpisodeButton || !episodeModal) {
    console.error('Episode selector elements not found');
    return;
  }

  selectEpisodeButton.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening episode modal');
    episodeModal.classList.add('active');
  });

  document.addEventListener('click', e => {
    if (episodeModal.classList.contains('active')) {
      if (e.target.closest('.close-modal')) {
        e.preventDefault();
        e.stopPropagation();
        episodeModal.classList.remove('active');
        return;
      }

      const modalContent = episodeModal.querySelector('.episode-modal-content');
      if (modalContent && !modalContent.contains(e.target)) {
        episodeModal.classList.remove('active');
      }
    }
  });

  document.addEventListener('click', async e => {
    const seasonItem = e.target.closest('.season-item');
    if (seasonItem) {
      const seasonNumber = parseInt(seasonItem.dataset.seasonNumber, 10);
      document.querySelectorAll('.season-item').forEach(item => {
        item.classList.remove('selected');
      });
      seasonItem.classList.add('selected');

      try {
        const seasonData = await app.tmdbService.fetchFromAPI(
          `/tv/${media.id}/season/${seasonNumber}`,
        );
        const episodes = seasonData.episodes || [];
        const episodesGrid = document.querySelector('.episodes-grid');
        if (episodesGrid) {
          episodesGrid.innerHTML = episodes
            .map(episode => {
              const hasImage = episode.still_path !== null;
              const thumbnailContent = hasImage
                ? `<img src='https://image.tmdb.org/t/p/w780${episode.still_path}'
                     alt='Episode ${episode.episode_number}'
                     class='episode-thumbnail'
                     loading='lazy'>`
                : `<div class='episode-thumbnail no-image'>${episodePlaceholderSvg}</div>`;

              return `
              <div class='episode-card' data-episode='${
  episode.episode_number
}'>
                <div class='relative'>
                  ${thumbnailContent}
                  <div class='episode-progress'>
                    <div class='episode-progress-fill' style='width: 0%'></div>
                  </div>
                </div>
                <div class='episode-info'>
                  <div class='episode-number'>Episode ${
  episode.episode_number
}</div>
                  <div class='episode-title'>${episode.name}</div>
                  <div class='episode-overview'>${
  episode.overview || 'No description available.'
}</div>
                </div>
              </div>`;
            })
            .join('');
          attachEpisodeClickHandlers(app);
        }
      } catch (error) {
        console.error('Failed to fetch season data:', error);
      }
    }
  });

  document.addEventListener('input', e => {
    if (e.target.matches('#episodeSearchInput')) {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.episode-card').forEach(card => {
        const title = card
          .querySelector('.episode-title')
          .textContent.toLowerCase();
        const overview = card
          .querySelector('.episode-overview')
          .textContent.toLowerCase();
        const number = card
          .querySelector('.episode-number')
          .textContent.toLowerCase();
        const matches = title.includes(searchTerm)
          || overview.includes(searchTerm)
          || number.includes(searchTerm);
        card.style.display = matches ? '' : 'none';
      });
    }
  });

  attachEpisodeClickHandlers(app);
};

export const setupPlayHandler = (app, media, mediaType) => {
  const playButton = document.getElementById('playButton');
  const watchPartyButton = document.getElementById('watchPartyButton');

  if (playButton) {
    playButton.addEventListener('click', async () => {
      try {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
          videoPlayer.classList.remove('hidden');
          if (mediaType === 'tv') {
            const selectedSeason = document.querySelector(
              '.season-item.selected',
            );
            const selectedEpisode = document.querySelector(
              '.episode-card.selected',
            );
            if (selectedSeason && selectedEpisode) {
              const seasonNumber = parseInt(
                selectedSeason.dataset.seasonNumber,
                10,
              );
              const episodeNumber = parseInt(
                selectedEpisode.dataset.episode,
                10,
              );
              await app.mediaPlayer.play(media, seasonNumber, episodeNumber);
            } else {
              await app.mediaPlayer.play(media);
            }
          } else {
            await app.mediaPlayer.play(media);
          }
        }
      } catch (error) {
        console.error('Failed to load video:', error);
        app.showError('Failed to load video content');
      }
    });
  }

  if (watchPartyButton) {
    watchPartyButton.addEventListener('click', async () => {
      try {
        let options = {};

        if (mediaType === 'tv') {
          const selectedSeason = document.querySelector(
            '.season-item.selected',
          );
          const selectedEpisode = document.querySelector(
            '.episode-card.selected',
          );
          if (!selectedSeason || !selectedEpisode) {
            app.showError('Please select an episode first');
            return;
          }
          options = {
            season: parseInt(selectedSeason.dataset.seasonNumber, 10),
            episode: parseInt(selectedEpisode.dataset.episode, 10),
          };
        }

        const vidsrcUrl = await videoProviders.getProviderUrl(
          'vidsrc2',
          mediaType,
          media.id,
          options,
        );
        const response = await fetch(vidsrcUrl);
        const html = await response.text();
        const match = html.match(/https:\/\/[^"']+\.m3u8[^"']*/);

        if (match) {
          const m3u8Url = match[0];
          const watchPartyUrl = `https://www.watchparty.me/create?video=${encodeURIComponent(
            m3u8Url,
          )}`;
          window.open(watchPartyUrl, '_blank');
        } else {
          app.showError('Could not get stream URL');
        }
      } catch (error) {
        console.error('Failed to create watch party:', error);
        app.showError('Failed to create watch party');
      }
    });
  }
};

export const setupShareHandler = (app, media, mediaType, details) => {
  const shareButton = document.getElementById('shareButton');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('mediaId', media.id);
      url.searchParams.set('mediaType', mediaType);
      const shareText = `Check out ${
        details.title || details.name
      } on Novafork!`;

      if (navigator.share) {
        navigator
          .share({
            title: details.title || details.name,
            text: shareText,
            url: url.toString(),
          })
          .catch(error => {
            console.error('Error sharing:', error);
            app.showError('Failed to share content');
          });
      } else {
        navigator.clipboard
          .writeText(url.toString())
          .then(() => app.showError('Link copied to clipboard!'))
          .catch(() => app.showError('Failed to copy link'));
      }
    });
  }
};

export const setupTrailerHandler = trailer => {
  const trailerBtn = document.getElementById('trailerButton');
  if (trailerBtn && trailer) {
    trailerBtn.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'trailer-modal';
      modal.innerHTML = `
        <div class='trailer-modal-content'>
          <button class='close-trailer'>
            <i class='fas fa-times'></i>
          </button>
          <iframe 
            src='https://www.youtube.com/embed/${trailer.key}?autoplay=1'
            frameborder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowfullscreen>
          </iframe>
        </div>`;

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
};

export const setupProviderHandler = (app, media) => {
  const providerSelect = document.getElementById('providerSelect');
  if (providerSelect) {
    providerSelect.addEventListener('change', e => {
      app.mediaPlayer.currentProvider = e.target.value;
      const videoPlayer = document.getElementById('videoPlayer');
      if (videoPlayer && !videoPlayer.classList.contains('hidden')) {
        app.mediaPlayer.play(media);
      }
    });
  }
};

export const setupLanguageHandler = () => {
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', e => {
      localStorage.setItem('preferredLanguage', e.target.value);
    });
  }
};
