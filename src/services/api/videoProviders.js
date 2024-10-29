const providers = {
  // Premium Providers
  vidlink: {
    name: 'VidLink - Premium',
    movie: id => `https://vidlink.pro/movie/${id}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=false`,
    tv: (id, season, episode) => `https://vidlink.pro/tv/${id}/${season || 1}/${episode || 1}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&nextbutton=true&autoplay=false`,
  },
  vidlinkdub: {
    name: 'VidLink Dub - Multi Language',
    movie: id => `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF`,
    tv: (id, season, episode) => `https://vidlink.pro/tv/${id}/${season || 1}/${episode || 1}?player=jw&multiLang=true`,
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
  cinescrape: {
    name: 'Cinescrape - 4K',
    movie: async id => {
      const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      setTimeout(() => {}, randomDelay);

      const response = await fetch(`https://scraper.cinescrape.com/movie/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const movieSource = data.find(source => source.quality === '2160p' || source.quality === '1080p');

      if (movieSource?.metadata?.baseUrl) {
        const urlObj = new URL(`${movieSource.metadata.baseUrl}.mpd`);
        urlObj.protocol = 'https:';
        return urlObj.toString();
      }
      throw new Error('No suitable video source found');
    },
    tv: async (id, season, episode) => {
      const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      setTimeout(() => {}, randomDelay);

      const response = await fetch(`https://scraper.cinescrape.com/tvshow/${id}/${season}/${episode}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (!data?.length) throw new Error('No video data available');

      const qualityOrder = ['2160p', '1080p', '720p', '360p'];
      const selectedSource = qualityOrder.reduce((found, quality) => found || data.find(source => source.quality === quality), null);

      if (selectedSource?.metadata?.baseUrl) {
        const urlObj = new URL(`${selectedSource.metadata.baseUrl}.mpd`);
        urlObj.protocol = 'https:';
        return urlObj.toString();
      }
      throw new Error('No suitable video source found');
    },
  },
  multiembedvip: {
    name: 'MultiEmbed VIP',
    movie: id => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id, season, episode) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season || 1}&e=${episode || 1}`,
  },

  // Standard Providers
  vidsrc: {
    name: 'VidSrc',
    movie: id => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`,
    tv: (id, season, episode) => `https://vidsrc.cc/v2/embed/tv/${id}/${season || 1}/${episode || 1}?autoPlay=true&autoNext=true`,
  },
  vidsrc2: {
    name: 'VidSrc 2',
    movie: id => `https://vidsrc2.to/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc2.to/embed/tv/${id}?season=${season || 1}&episode=${episode || 1}`,
  },
  vidsrcxyz: {
    name: 'VidSrc XYZ',
    movie: id => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.xyz/embed/tv/${id}?season=${season || 1}&episode=${episode || 1}`,
  },
  vidsrcrip: {
    name: 'VidSrc RIP',
    movie: id => `https://vidsrc.rip/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.rip/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  vidsrcicu: {
    name: 'VidSrc ICU',
    movie: id => `https://vidsrc.icu/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.icu/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  embedsoap: {
    name: 'EmbedSoap',
    movie: id => `https://www.embedsoap.com/embed/movie/?id=${id}`,
    tv: (id, season, episode) => `https://www.embedsoap.com/embed/tv/?id=${id}&s=${season || 1}&e=${episode || 1}`,
  },
  embedsu: {
    name: 'EmbedSu',
    movie: id => `https://embed.su/embed/movie/${id}`,
    tv: (id, season, episode) => `https://embed.su/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  autoembed: {
    name: 'AutoEmbed',
    movie: id => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, season, episode) => `https://player.autoembed.cc/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  smashystream: {
    name: 'SmashyStream',
    movie: id => `https://player.smashy.stream/movie/${id}`,
    tv: (id, season, episode) => `https://player.smashy.stream/tv/${id}?s=${season || 1}&e=${episode || 1}`,
  },
  multiembed: {
    name: 'MultiEmbed',
    movie: id => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, season, episode) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season || 1}&e=${episode || 1}`,
  },
  moviesapi: {
    name: 'MoviesAPI',
    movie: id => `https://moviesapi.club/movie/${id}`,
    tv: (id, season, episode) => `https://moviesapi.club/tv/${id}/${season || 1}/${episode || 1}`,
  },
  moviee: {
    name: 'Moviee',
    movie: id => `https://moviee.tv/embed/movie/${id}`,
    tv: (id, season, episode) => `https://moviee.tv/embed/tv/${id}?seasion=${season || 1}&episode=${episode || 1}`,
  },

  // Anime Providers
  anime: {
    name: 'Anime',
    movie: id => `https://anime.autoembed.cc/embed/${id}-episode-1`,
    tv: (id, season, episode, title) => `https://anime.autoembed.cc/embed/${title?.replace(/\s+/g, '-').toLowerCase()}-episode-${episode || 1}`,
  },
  twoanime: {
    name: '2AnimeHub',
    movie: id => `https://2anime.xyz/embed/${id}-episode-1`,
    tv: (id, season, episode, title) => `https://2anime.xyz/embed/${title?.replace(/\s+/g, '-').toLowerCase()}-episode-${episode || 1}`,
  },
  twoembed: {
    name: '2Embed',
    movie: id => `https://www.2embed.cc/embed/${id}`,
    tv: (id, season, episode) => `https://www.2embed.skin/embedtv/${id}&s=${season || 1}&e=${episode || 1}`,
  },
  adminhihi: {
    name: 'AdminHiHi',
    movie: (id, title) => {
      const movieSlug = title?.replace(/\s+/g, '-') || id;
      return `https://embed.anicdn.top/v/${movieSlug}-dub/1.html`;
    },
    tv: (id, season, episode, title) => {
      const tvSlug = title?.replace(/\s+/g, '-') || id;
      return `https://embed.anicdn.top/v/${tvSlug}-dub/${episode || 1}.html`;
    },
  },

  // Alternative Providers
  filmxy: {
    name: 'FilmXY - Multi Language',
    movie: async (id, language) => {
      if (!language) throw new Error('Language is required for filmxy provider');
      const url = `https://cinescrape.com/global/${language.toLowerCase()}/${id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const m3u8Link = data.streamData.data.link;
      if (!m3u8Link) throw new Error('No m3u8 link found');
      return m3u8Link;
    },
  },
  nontongo: {
    name: 'NontonGo',
    movie: id => `https://www.NontonGo.win/embed/movie/${id}`,
    tv: (id, season, episode) => `https://www.NontonGo.win/embed/tv/${id}/${season || 1}/${episode || 1}`,
  },
  nontongoalt: {
    name: 'NontonGo Alt',
    tv: (id, season, episode) => `https://www.NontonGo.win/embed/tv/?id=${id}&s=${season || 1}&e=${episode || 1}`,
  },
};

export const getProviderGroups = () => ({
  premium: [
    { id: 'vidlink', name: 'VidLink - Premium' },
    { id: 'vidlinkdub', name: 'VidLink Dub - Multi Language' },
    { id: 'vidbinge', name: 'VidBinge - 4K' },
    { id: 'vidsrcnl', name: 'VidSrc NL' },
    { id: 'cinescrape', name: 'Cinescrape - 4K' },
    { id: 'multiembedvip', name: 'MultiEmbed VIP' },
  ],
  standard: [
    { id: 'vidsrc', name: 'VidSrc' },
    { id: 'vidsrc2', name: 'VidSrc 2' },
    { id: 'vidsrcxyz', name: 'VidSrc XYZ' },
    { id: 'vidsrcrip', name: 'VidSrc RIP' },
    { id: 'vidsrcicu', name: 'VidSrc ICU' },
    { id: 'embedsoap', name: 'EmbedSoap' },
    { id: 'embedsu', name: 'EmbedSu' },
    { id: 'autoembed', name: 'AutoEmbed' },
    { id: 'smashystream', name: 'SmashyStream' },
    { id: 'multiembed', name: 'MultiEmbed' },
    { id: 'moviesapi', name: 'MoviesAPI' },
    { id: 'moviee', name: 'Moviee' },
  ],
  anime: [
    { id: 'anime', name: 'Anime' },
    { id: 'twoanime', name: '2AnimeHub' },
    { id: 'twoembed', name: '2Embed' },
    { id: 'adminhihi', name: 'AdminHiHi' },
  ],
  alternative: [
    { id: 'filmxy', name: 'FilmXY - Multi Language' },
    { id: 'nontongo', name: 'NontonGo' },
    { id: 'nontongoalt', name: 'NontonGo Alt' },
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
      const url = await providerConfig.movie(id, options.title);
      console.log('Generated movie URL:', url);
      return url;
    }
    if (type === 'tv' && providerConfig.tv) {
      const url = await providerConfig.tv(id, options.season, options.episode, options.title);
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
