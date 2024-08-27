async function displaySelectedMedia(media, mediaType) {
    const selectedMovie = document.getElementById('selectedMovie');
    const apiKey = localStorage.getItem('apiKey');

    let ratings = '';
    let popularity = '';
    let castList = '';
    let seasonSection = '';

    try {
        let response;
        if (mediaType === 'tv') {
            response = await fetch(`https://api.themoviedb.org/3/tv/${media.id}?api_key=${apiKey}`);
        } else {
            response = await fetch(`https://api.themoviedb.org/3/movie/${media.id}?api_key=${apiKey}`);
        }
        const data = await response.json();
        const voteAverage = data.vote_average || 0;
        const popularityScore = data.popularity || 0;
        const castResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${media.id}/credits?api_key=${apiKey}`);
        const castData = await castResponse.json();
        const cast = castData.cast || [];

        // Format rating and popularity
        const stars = Math.round(voteAverage / 2); // TMDB ratings are out of 10, so divide by 2 for 5-star scale
        ratings = `
            <div class="flex items-center space-x-1 mb-2">
                <span class="text-yellow-400">${'★'.repeat(stars)}</span>
                <span class="text-gray-300">${'★'.repeat(5 - stars)}</span>
                <span class="ml-2 text-sm text-gray-300">${voteAverage.toFixed(1)}/10</span>
            </div>
        `;
        popularity = `
            <div class="text-sm text-gray-300 mb-4">Popularity: <span class="font-semibold">${popularityScore.toFixed(1)}</span></div>
        `;

        // Format cast
        castList = cast.slice(0, 5).map(actor =>
            `<div class="flex-shrink-0 w-32 mx-2">
                <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" alt="${actor.name}" class="w-full h-32 rounded-full object-cover shadow-md">
                <div class="mt-2 text-center">
                    <p class="text-white font-semibold">${actor.name}</p>
                    <p class="text-gray-400 text-sm">${actor.character}</p>
                </div>
            </div>`
        ).join('');

        // Format season and episode select if it's a TV show
        if (mediaType === 'tv') {
            seasonSection = `
                <div class="mt-4">
                    <!-- Season Select Dropdown -->
                    <label for="seasonSelect" class="block text-sm font-medium text-gray-300">Select Season:</label>
                    <select id="seasonSelect" class="dropdown mt-1 block w-full bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:ring-blue-500">
                        ${media.seasons.map(season =>
                `<option value="${season.season_number}">Season ${season.season_number}: ${season.name}</option>`
            ).join('')}
                    </select>

                    <!-- Episode Select Dropdown -->
                    <label for="episodeSelect" class="block text-sm font-medium text-gray-300 mt-2">Select Episode:</label>
                    <select id="episodeSelect" class="dropdown mt-1 block w-full bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:ring-blue-500"></select>
                </div>
            `;
        }

    } catch (error) {
        console.error('Failed to fetch ratings, popularity, and cast:', error);
        ratings = 'Rating: Not available';
        popularity = 'Popularity: Not available';
        castList = 'Cast: Not available';
    }

    // Load and populate the template
    const response = await fetch('media/mediaTemplate.html');
    const template = await response.text();

    const populatedHTML = template
        .replace(/{{poster_path}}/g, media.poster_path)
        .replace(/{{title_or_name}}/g, media.title || media.name)
        .replace(/{{release_date_or_first_air_date}}/g, media.release_date || media.first_air_date)
        .replace(/{{overview}}/g, media.overview)
        .replace(/{{type}}/g, mediaType === 'movie' ? 'Movie' : 'TV Show')
        .replace(/{{ratings}}/g, ratings)
        .replace(/{{popularity}}/g, popularity)
        .replace(/{{cast_list}}/g, castList)
        .replace(/{{season_section}}/g, seasonSection);

    selectedMovie.innerHTML = populatedHTML;

    const playButton = document.getElementById('playButton');
    const videoPlayer = selectedMovie.querySelector('#videoPlayer');
    const movieInfo = selectedMovie.querySelector('#movieInfo');
    const languageSelect = document.getElementById('languageSelect');
    const providerSelect = document.getElementById('providerSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');

    async function updateVideo() {
        if (!videoPlayer || !movieInfo) {
            console.error("Error: videoPlayer or movieInfo elements not found.");
            return;
        }

        let endpoint;
        const language = languageSelect.value;
        const provider = providerSelect.value;

        if (mediaType === 'tv') {
            const seasonNumber = seasonSelect.value;
            const episodeNumber = episodeSelect.value;

            if (!seasonNumber || !episodeNumber) {
                console.error("Error: Season number or episode number not selected.");
                return;
            }

            switch (provider) {
                case 'vidsrc':
                    endpoint = `https://vidsrc.cc/v2/embed/tv/${media.id}/${seasonNumber}/${episodeNumber}`;
                    break;
                case 'vidsrc2':
                    endpoint = `https://vidsrc2.to/embed/tv/${media.id}?season=${seasonNumber}&episode=${episodeNumber}`;
                    break;
                case 'vidsrcxyz':
                    endpoint = `https://vidsrc.xyz/embed/tv/${media.id}?season=${seasonNumber}&episode=${episodeNumber}`;
                    break;
                case 'superembed':
                    endpoint = `https://multiembed.mov/?video_id=${media.id}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
                    break;
                case 'embedsoap':
                    endpoint = `https://www.embedsoap.com/embed/tv/?id=${media.id}&s=${seasonNumber}&e=${episodeNumber}`;
                    break;
                case 'autoembed':
                    endpoint = `https://autoembed.co/tv/tmdb/${media.id}-${seasonNumber}-${episodeNumber}`;
                    break;
                case 'smashystream':
                    endpoint = `https://player.smashy.stream/tv/${media.id}?s=${seasonNumber}&e=${episodeNumber}`;
                    break;
                case 'trailer':
                    const trailerResponse = await fetch(`https://api.themoviedb.org/3/tv/${media.id}/videos?api_key=${apiKey}`);
                    const trailerData = await trailerResponse.json();
                    const trailer = trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                    if (trailer) {
                        endpoint = `https://www.youtube.com/embed/${trailer.key}`;
                    } else {
                        alert('Trailer not available.');
                        return;
                    }
                    break;
                default:
                    console.error('Provider not recognized.');
                    return;
            }
        } else {
            switch (provider) {
                case 'vidsrc':
                    endpoint = `https://vidsrc.cc/v2/embed/movie/${media.id}`;
                    break;
                case 'vidsrc2':
                    endpoint = `https://vidsrc2.to/embed/movie/${media.id}`;
                    break;
                case 'vidsrcxyz':
                    endpoint = `https://vidsrc.xyz/embed/movie/${media.id}`;
                    break;
                case 'superembed':
                    endpoint = `https://multiembed.mov/?video_id=${media.id}&tmdb=1`;
                    break;
                case 'embedsoap':
                    endpoint = `https://www.embedsoap.com/embed/movie/${media.id}`;
                    break;
                case 'autoembed':
                    endpoint = `https://autoembed.co/movie/tmdb/${media.id}`;
                    break;
                case 'smashystream':
                    endpoint = `https://player.smashy.stream/movie/${media.id}`;
                    break;
                case 'trailer':
                    const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${media.id}/videos?api_key=${apiKey}`);
                    const trailerData = await trailerResponse.json();
                    const trailer = trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                    if (trailer) {
                        endpoint = `https://www.youtube.com/embed/${trailer.key}`;
                    } else {
                        alert('Trailer not available.');
                        return;
                    }
                    break;
                default:
                    console.error('Provider not recognized.');
                    return;
            }
        }

        videoPlayer.querySelector('.relative').innerHTML = `<iframe src="${endpoint}" class="w-full" style="height: ${document.getElementById('poster').offsetHeight}px;" allowfullscreen></iframe>`;
        videoPlayer.classList.remove('hidden');
        movieInfo.classList.add('hidden');
    }

    playButton.addEventListener('click', updateVideo);

    languageSelect.addEventListener('change', () => {
        const providerSelect = document.getElementById('providerSelect');
        providerSelect.classList.toggle('hidden', languageSelect.value === 'fr');
        updateVideo();
    });

    providerSelect.addEventListener('change', updateVideo);

    if (mediaType === 'tv') {
        async function updateEpisodes() {
            const seasonNumber = seasonSelect.value;
            if (!seasonNumber) return;

            const response = await fetch(`https://api.themoviedb.org/3/tv/${media.id}/season/${seasonNumber}?api_key=${apiKey}`);
            if (response.ok) {
                const season = await response.json();
                episodeSelect.innerHTML = season.episodes.map(episode =>
                    `<option value="${episode.episode_number}">Episode ${episode.episode_number}: ${episode.name}</option>`
                ).join('');
            } else {
                console.error('Failed to fetch season details.');
            }
        }

        seasonSelect.addEventListener('change', async () => {
            await updateEpisodes();
            updateVideo();
        });

        episodeSelect.addEventListener('change', updateVideo);

        updateEpisodes();
    }

    selectedMovie.scrollIntoView({ behavior: 'smooth' });
}