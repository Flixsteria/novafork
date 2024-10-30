export const formatDate = dateString => {
  if (!dateString) return 'Release date unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateRatingStars = rating => {
  if (!rating) return '☆☆☆☆☆';
  const stars = Math.round(rating / 2);
  return Array.from({ length: 5 }, (_, i) => (i < stars ? '★' : '☆')).join('');
};

export const generateImageUrl = (path, size = 'original') => {
  if (!path) return 'src/assets/placeholder.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const determineMediaType = media => media.media_type || (media.title ? 'movie' : 'tv');

export const filterUniqueMedia = mediaArray => {
  const seen = new Set();
  return mediaArray.filter(item => {
    if (!item || !item.id) return false;
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};

export const formatRuntime = minutes => {
  if (!minutes) return 'Duration not available';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`;
};

export const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

export const sanitizeSearchQuery = query => query.trim().toLowerCase();

export const extractYearFromDate = dateString => {
  if (!dateString) return null;
  return new Date(dateString).getFullYear();
};

export const sortMediaByDate = (mediaArray, dateField = 'release_date') => [...mediaArray].sort((a, b) => {
  const dateA = new Date(a[dateField] || a.first_air_date || 0);
  const dateB = new Date(b[dateField] || b.first_air_date || 0);
  return dateB - dateA;
});

export const getMediaIdentifier = media => {
  const type = determineMediaType(media);
  const title = media.title || media.name;
  return `${type}-${media.id}-${title}`;
};
