$(document).ready(async function() {
    const API_BASE_URL = 'https://api.themoviedb.org/3';
    let apiKey;
    const genreMap = {};

    const handleError = (message, error) => {
        console.error(`${message}: `, error);
    };

    const getApiKey = async () => {
        if (apiKey) return apiKey;
        try {
            const response = await $.getJSON('apis/config.json');
            apiKey = response.apiKey;
            return apiKey;
        } catch (error) {
            handleError('Failed to fetch API key', error);
            return null;
        }
    };

    const apiCall = async (endpoint, params = {}) => {
        const key = await getApiKey();
        if (!key) return null;
        params.api_key = key;
        const queryString = $.param(params);
        const url = `${API_BASE_URL}/${endpoint}?${queryString}`;
        try {
            return await $.getJSON(url);
        } catch (error) {
            handleError(`Error during API call to ${endpoint}`, error);
            return null;
        }
    };

    const fetchAllGenres = async () => {
        try {
            const [movieGenres, tvGenres] = await Promise.all([
                apiCall('genre/movie/list', { language: 'en-US' }),
                apiCall('genre/tv/list', { language: 'en-US' })
            ]);
            [...movieGenres.genres, ...tvGenres.genres].forEach(genre => {
                genreMap[genre.id] = genre.name;
            });
        } catch (error) {
            handleError('Failed to fetch genres', error);
        }
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const showLoading = () => {
        $('#searchSuggestions').html('<div class="spinner"></div>').removeClass('hidden');
    };

    const highlightText = (text, query) => {
        const words = query.split(/\s+/).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    const displaySearchSuggestions = (results, query) => {
        const $searchSuggestions = $('#searchSuggestions');
        if (results.length === 0) {
            $searchSuggestions.html('<div class="no-suggestions">No suggestions available</div>').removeClass('hidden');
            return;
        }

        const suggestionsHTML = results.map(media => {
            const mediaTypeLabel = media.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show';
            const mediaTitle = media.title || media.name;
            const mediaId = media.id;
            const mediaType = media.media_type;
            const mediaRating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
            const highlightedTitle = highlightText(mediaTitle, query);

            // Use higher-quality poster size: w154 or w185
            const posterPath = media.poster_path ? `https://image.tmdb.org/t/p/w185${media.poster_path}` : 'path-to-placeholder-image.jpg';
            const genreNames = (media.genre_ids || []).map(id => genreMap[id] || 'Unknown').slice(0, 2).join(', ');
            const year = media.release_date ? new Date(media.release_date).getFullYear() :
                (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'N/A');

            return `
            <div class="suggestion-item" data-id="${mediaId}" data-type="${mediaType}">
                <img src="${posterPath}" alt="${mediaTitle}" class="suggestion-poster">
                <div class="suggestion-content">
                    <h4 class="suggestion-title">${highlightedTitle}</h4>
                    <div class="suggestion-details">
                        <span class="suggestion-type">${mediaTypeLabel}</span>
                        <span class="suggestion-year">${year}</span>
                    </div>
                    <div class="suggestion-meta">
                        <span class="suggestion-rating">⭐ ${mediaRating}</span>
                        <span class="suggestion-genres">${genreNames}</span>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        $searchSuggestions.html(suggestionsHTML).removeClass('hidden');

        // On click of suggestion, fetch and display the selected media using the fetchSelectedMedia function
        $searchSuggestions.find('.suggestion-item').on('click', function() {
            const mediaId = $(this).data('id');
            const mediaType = $(this).data('type');
            fetchSelectedMedia(mediaId, mediaType); // Use fetchSelectedMedia to fetch and display details
            $searchSuggestions.addClass('hidden');
        });
    };

    const fetchSelectedMedia = async (mediaId, mediaType) => {
        try {
            const media = await apiCall(`${mediaType}/${mediaId}`);
            if (media) {
                displaySelectedMedia(media, mediaType);
    
                // Updated URL format to use tv/id or movie/id
                const newUrl = `${window.location.origin}${window.location.pathname}?path=${encodeURIComponent(mediaType)}/${encodeURIComponent(mediaId)}`;
                window.history.pushState({ mediaId, mediaType, title: media.title || media.name }, '', newUrl);
            } else {
                handleError('Failed to fetch media details.', new Error('API response not OK'));
            }
        } catch (error) {
            handleError('An error occurred while fetching media details:', error);
        }
    };
    

    const displaySearchResults = (results) => {
        const $mediaContainer = $('#mediaContainer');
        if (results.length === 0) {
            $mediaContainer.html('<div class="p-4 text-gray-400 text-center">No results found</div>');
            return;
        }
        const resultsHTML = results.map(media => {
            const posterPath = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'path-to-placeholder-image.jpg';
            const genreNames = (media.genre_ids || []).map(id => genreMap[id] || 'Unknown').join(', ');
            const releaseDate = media.release_date || media.first_air_date || 'N/A';
            const formattedDate = releaseDate !== 'N/A' ? new Date(releaseDate).toLocaleDateString() : 'N/A';
            const ratingStars = '★'.repeat(Math.round(media.vote_average / 2)) + '☆'.repeat(5 - Math.round(media.vote_average / 2));

            return `
                <div class="media-card" data-id="${media.id}" data-type="${media.media_type}">
                    <img src="${posterPath}" alt="${media.title || media.name}" class="media-image">
                    <div class="media-content">
                        <h3 class="media-title">${media.title || media.name}</h3>
                        <p class="media-type">${media.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</p>
                        <div class="media-details">
                            <p class="media-genres">Genres: ${genreNames}</p>
                            <div class="media-rating">
                                <span class="rating-stars">${ratingStars}</span>
                                <span>${media.vote_average.toFixed(1)}/10</span>
                            </div>
                            <p class="media-release-date">Release: ${formattedDate}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $mediaContainer.html(resultsHTML);

        $mediaContainer.find('.media-card').on('click', function () {
            const mediaId = $(this).data('id');
            const mediaType = $(this).data('type');
            fetchSelectedMedia(mediaId, mediaType);
        });
    };

    const handleSearchInput = debounce(async () => {
        const query = $('#searchInput').val().trim();
        if (query.length < 2) {
            $('#searchSuggestions').empty().addClass('hidden');
            return;
        }

        showLoading();

        const result = await apiCall('search/multi', { query, include_adult: false });
        if (result) {
            const filteredResults = result.results.filter(media =>
                media.media_type === 'movie' || media.media_type === 'tv'
            ).slice(0, 10);
            displaySearchSuggestions(filteredResults, query);
        }
    }, 300);

    const loadMediaFromUrlParams = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const mediaType = urlParams.get('mediaType');
        const mediaId = urlParams.get('mediaId');
        if (mediaType && mediaId) {
            await fetchSelectedMedia(mediaId, mediaType);
        }
    };

    const init = async () => {
        if (await getApiKey()) {
            await fetchAllGenres();
            await loadMediaFromUrlParams(); // Load media if URL parameters are present
        }
    };

    await init();

    $('#searchInput').on('input', handleSearchInput);
});
