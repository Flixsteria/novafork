class ProgressManager {
  constructor() {
    this.storageKey = 'vidLinkProgress';
  }

  getStoredData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch (error) {
      console.error('Error reading progress data:', error);
      return {};
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress data:', error);
    }
  }

  updateMediaProgress(mediaId, mediaType, data) {
    const storedData = this.getStoredData();

    if (!storedData[mediaId]) {
      storedData[mediaId] = {
        id: mediaId,
        type: mediaType,
        progress: {},
        last_updated: Date.now(),
      };
    }

    if (mediaType === 'tv') {
      const { season, episode, progress } = data;
      const episodeKey = `s${season}e${episode}`;

      if (!storedData[mediaId].show_progress) {
        storedData[mediaId].show_progress = {};
      }

      storedData[mediaId].show_progress[episodeKey] = {
        season,
        episode,
        progress,
        last_updated: Date.now(),
      };

      storedData[mediaId].last_season_watched = season;
      storedData[mediaId].last_episode_watched = episode;
    } else {
      storedData[mediaId].progress = {
        ...storedData[mediaId].progress,
        ...data,
        last_updated: Date.now(),
      };
    }

    this.saveData(storedData);
  }

  getMediaProgress(mediaId, mediaType, season = null, episode = null) {
    const storedData = this.getStoredData();
    const mediaData = storedData[mediaId];

    if (!mediaData) return null;

    if (mediaType === 'tv' && season && episode) {
      const episodeKey = `s${season}e${episode}`;
      return mediaData.show_progress?.[episodeKey]?.progress || null;
    }

    return mediaData.progress || null;
  }

  getLastWatched(mediaId) {
    const storedData = this.getStoredData();
    const mediaData = storedData[mediaId];

    if (!mediaData) return null;

    return {
      season: mediaData.last_season_watched,
      episode: mediaData.last_episode_watched,
      lastUpdated: mediaData.last_updated,
    };
  }

  clearProgress(mediaId) {
    const storedData = this.getStoredData();
    delete storedData[mediaId];
    this.saveData(storedData);
  }
}

export default new ProgressManager();
