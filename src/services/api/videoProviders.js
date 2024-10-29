const providers = {
  vidsrc: {
    name: 'VidSrc',
    movie: id => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`,
    tv: (id, season, episode) => `https://vidsrc.cc/v2/embed/tv/${id}/${season || 1}/${episode || 1}?autoPlay=true&autoNext=true`,
  },
  vidlink: {
    name: 'VidLink',
    movie: id => `https://vidlink.pro/movie/${id}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=false`,
    tv: (id, season, episode) => `https://vidlink.pro/tv/${id}/${season || 1}/${episode || 1}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&nextbutton=true&autoplay=false`,
  },
  vidbinge: {
    name: 'VidBinge - 4K',
    movie: id => `https://vidbinge.dev/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidbinge.dev/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  vidsrcnl: {
    name: 'VidSrc NL',
    movie: id => `https://player.vidsrc.nl/embed/movie/${id}`,
    tv: (id, season, episode) => `https://player.vidsrc.nl/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  embedsu: {
    name: 'Embedsu',
    movie: id => `https://embedsu.me/movie/${id}`,
    tv: (id, season, episode) => `https://embedsu.me/tv/${id}/${season || 1}/${episode || 1}`,
  },
  vidsrcicu: {
    name: 'VidSrc ICU',
    movie: id => `https://vidsrc.icu/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.icu/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
};

export const getProviderGroups = () => ({
  premium: [
    { id: 'vidlink', name: 'VidLink - Premium' },
    { id: 'vidbinge', name: 'VidBinge - 4K' },
    { id: 'vidsrcnl', name: 'VidSrc NL' },
  ],
  standard: [
    { id: 'vidsrc', name: 'VidSrc' },
    { id: 'embedsu', name: 'Embedsu' },
    { id: 'vidsrcicu', name: 'VidSrc ICU' },
  ],
});

export const getProviderUrl = async (provider, type, id, options = {}) => {
  const providerConfig = providers[provider];
  if (!providerConfig) {
    console.error('Provider not found:', provider);
    throw new Error('Provider not found');
  }

  try {
    if (type === 'movie') {
      const url = providerConfig.movie(id);
      console.log('Generated movie URL:', url);
      return url;
    } if (type === 'tv' && providerConfig.tv) {
      const url = providerConfig.tv(id, options.season, options.episode);
      console.log('Generated TV URL:', url);
      return url;
    }
  } catch (error) {
    console.error('Error generating URL:', error);
    throw error;
  }

  throw new Error('Unsupported media type for this provider');
};

export const isProviderAvailable = (provider, type) => providers[provider] && (type === 'movie' ? !!providers[provider].movie : !!providers[provider].tv);

export default {
  getProviderGroups,
  getProviderUrl,
  isProviderAvailable,
};
