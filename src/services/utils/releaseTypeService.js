class ReleaseTypeService {
  constructor() {
    this.apiKey = null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async getReleaseType(id, mediaType) {
    try {
      if (!this.apiKey) {
        throw new Error('API key not set');
      }

      const certifications = {};
      let releaseType = '';

      if (mediaType === 'movie') {
        // For movies, use release_dates endpoint
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${this.apiKey}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch release dates');
        }

        const data = await response.json();
        const releases = data.results || [];

        // Get US release info
        const usRelease = releases.find(r => r.iso_3166_1 === 'US');
        if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
          certifications.US = usRelease.release_dates[0].certification;

          // Determine release type based on dates and types
          const now = new Date();
          const releaseDates = usRelease.release_dates.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

          const hasTheatrical = releaseDates.some(r => r.type === 3);
          const hasDigital = releaseDates.some(r => r.type === 4);
          const hasPhysical = releaseDates.some(r => r.type === 5);

          const firstDate = new Date(releaseDates[0].release_date);
          const latestDate = new Date(releaseDates[releaseDates.length - 1].release_date);

          if (firstDate > now) {
            releaseType = 'Not Released';
          } else if (now >= latestDate) {
            if (hasPhysical) releaseType = 'HD';
            else if (hasDigital) releaseType = 'HD';
            else if (hasTheatrical) releaseType = 'CAM';
            else releaseType = 'HD'; // Default to HD if release type is unclear
          } else {
            // Movie is in between release dates
            if (hasDigital || hasPhysical) releaseType = 'HD';
            else if (hasTheatrical) releaseType = 'CAM';
            else releaseType = 'CAM';
          }
        }
      } else if (mediaType === 'tv') {
        // For TV shows, use content_ratings endpoint
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/content_ratings?api_key=${this.apiKey}`,
        );

        if (!response.ok) {
          // If content_ratings fails, try external IDs
          const externalResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${this.apiKey}`,
          );

          if (externalResponse.ok) {
            const externalData = await externalResponse.json();
            if (externalData.tvdb_id) {
              certifications.US = 'TV-14'; // Default rating
            }
          }
        } else {
          const data = await response.json();
          const ratings = data.results || [];

          // Get US rating
          const usRating = ratings.find(r => r.iso_3166_1 === 'US');
          if (usRating) {
            certifications.US = usRating.rating;
          }
        }

        // Get TV show details to determine if it's still airing
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${this.apiKey}`,
        );

        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          const now = new Date();
          const firstAirDate = new Date(details.first_air_date);

          if (firstAirDate > now) {
            releaseType = 'Not Released';
          } else if (details.status === 'Ended') {
            releaseType = 'HD';
          } else {
            releaseType = 'HD'; // Assume HD for currently airing shows
          }
        } else {
          releaseType = 'HD'; // Default to HD if we can't determine
        }
      }

      return {
        releaseType,
        certifications,
      };
    } catch (error) {
      console.error('Error fetching release type and certifications:', error.message);
      return {
        releaseType: mediaType === 'tv' ? 'HD' : 'CAM',
        certifications: {},
      };
    }
  }
}

export default new ReleaseTypeService();
