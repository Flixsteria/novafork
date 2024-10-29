import MediaCard from './MediaCard.js';

class MediaGrid {
  constructor(containerId, onMediaSelect) {
    this.container = document.getElementById(containerId);
    this.onMediaSelect = onMediaSelect;
    this.genreMap = {};
    if (!this.container) {
      console.error('MediaGrid container not found:', containerId);
    }
  }

  setGenreMap(genreMap) {
    this.genreMap = genreMap || {};
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  showLoading() {
    if (!this.container) return;
    this.clear(); // Clear existing content before showing loading
    this.container.innerHTML = `
            <div class="flex justify-center items-center p-12 col-span-full">
                <div class="loading-spinner"></div>
                <span class="ml-3 text-lg text-gray-300">Loading content...</span>
            </div>
        `;
  }

  showError(message) {
    if (!this.container) return;
    this.clear(); // Clear existing content before showing error
    this.container.innerHTML = `
            <div class="text-center p-12 col-span-full">
                <div class="text-red-500 mb-4">
                    <i class="fas fa-exclamation-circle text-4xl"></i>
                </div>
                <p class="text-lg text-gray-300">${message}</p>
                <button onclick="location.reload()" 
                        class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                    Try Again
                </button>
            </div>
        `;
  }

  async displayMedia(mediaList) {
    if (!this.container || !Array.isArray(mediaList)) {
      console.error('Invalid media list or container');
      return;
    }

    this.clear(); // Ensure container is empty before displaying new content

    if (mediaList.length === 0) {
      this.showError('No content found');
      return;
    }

    try {
      const fragment = document.createDocumentFragment(); // Use document fragment for better performance

      for (const media of mediaList) {
        if (!media) continue;

        const mediaCard = new MediaCard(media, this.genreMap);
        const cardElement = await mediaCard.addClickHandler(this.onMediaSelect);

        if (cardElement) {
          fragment.appendChild(cardElement);
        }
      }

      // Append all cards at once
      this.container.appendChild(fragment);

      // Setup lazy loading for images after appending the fragment
      this.setupLazyLoading();
    } catch (error) {
      console.error('Error displaying media:', error);
      this.showError('Failed to display media content');
    }
  }

  setupLazyLoading() {
    const images = this.container.getElementsByTagName('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            const newImg = new Image();
            newImg.onload = () => {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            };
            newImg.src = img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });

    Array.from(images).forEach(img => {
      if (img.src && !img.src.includes('data:image')) {
        img.dataset.src = img.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent placeholder
        imageObserver.observe(img);
      }
    });
  }
}

export default MediaGrid;
