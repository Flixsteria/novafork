import videoProviders from '../../services/api/videoProviders.js';
import LoadingScreen from '../ui/LoadingScreen.js';

class MediaPlayer {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.currentProvider = 'vidlink';
    this.currentMedia = null;
    this.setupProviderSelect();
  }

  generateProviderOptionHtml(provider) {
    return `<option value="${provider.id}">${provider.name}</option>`;
  }

  generateProviderGroupHtml(groupName, providers) {
    const label = groupName === 'premium' ? 'Best Providers (No Ads)' : 'Alternative Providers (Ads May Appear)';
    const options = providers.map(provider => this.generateProviderOptionHtml(provider)).join('');
    return `<optgroup label="${label}">${options}</optgroup>`;
  }

  setupProviderSelect() {
    const providerSelect = document.getElementById('providerSelect');
    if (!providerSelect) return;

    const groups = videoProviders.getProviderGroups();
    const html = Object.entries(groups)
      .map(([groupName, providers]) => this.generateProviderGroupHtml(groupName, providers))
      .join('');

    providerSelect.innerHTML = html;
    providerSelect.value = this.currentProvider;

    providerSelect.addEventListener('change', e => {
      this.currentProvider = e.target.value;
      if (this.currentMedia) {
        this.play(this.currentMedia);
      }
    });
  }

  async play(media, seasonNumber = null, episodeNumber = null) {
    this.container = document.getElementById(this.containerId);

    if (!media || !this.container) {
      console.error('Invalid media or container');
      return;
    }

    try {
      LoadingScreen.show();
      this.currentMedia = media;

      const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
      console.log('Playing media:', {
        type: mediaType,
        id: media.id,
        provider: this.currentProvider,
        season: seasonNumber,
        episode: episodeNumber,
      });

      this.container.classList.add('loading');
      this.container.classList.remove('hidden');

      const options = mediaType === 'tv' && seasonNumber && episodeNumber
        ? { season: seasonNumber, episode: episodeNumber }
        : {};

      const url = await videoProviders.getProviderUrl(
        this.currentProvider,
        mediaType,
        media.id,
        options,
      );

      console.log('Provider URL:', url);

      const playerHtml = `
                <iframe 
                    src="${url}"
                    allow="fullscreen; autoplay; picture-in-picture"
                    loading="lazy"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 1;">
                </iframe>
                <button id="closePlayerButton" class="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-2">
                    <i class="fas fa-times"></i>
                </button>
            `;

      this.container.classList.remove('loading');
      this.container.innerHTML = playerHtml;

      const closeButton = document.getElementById('closePlayerButton');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.hide());
      }

      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });

      LoadingScreen.hide();
    } catch (error) {
      console.error('Error playing media:', error);
      LoadingScreen.hide();
      this.showError('Failed to load media content');
    }
  }

  showError(message) {
    if (!this.container) return;

    this.container.classList.remove('loading');
    this.container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[400px] text-center p-4 bg-black rounded-lg">
                <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                <p class="text-white text-lg mb-4">${message}</p>
                <button onclick="location.reload()" 
                        class="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                    Try Again
                </button>
            </div>
        `;
  }

  hide() {
    this.container = document.getElementById(this.containerId);

    if (this.container) {
      this.container.classList.remove('loading');
      this.container.classList.add('hidden');
      this.container.innerHTML = '';
      this.currentMedia = null;
    }
  }
}

export default MediaPlayer;
