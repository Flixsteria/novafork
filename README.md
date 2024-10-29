<p align="center">
  <strong>Nova - revamp </strong> – Got bored tbh, use the real novafork.
</p>

> **This project is a fork of [novafork](https://github.com/noname25495/novafork), enhanced with additional features and improvements.**

# Nova ☄

## ⚠️ Legal Disclaimer

This project is for **educational purposes only**. We do not host, distribute, or promote any copyrighted content. All media content is provided by third-party services over which we have no control or affiliation. Users are responsible for ensuring their use complies with applicable laws and regulations.

- All streaming content is hosted by third-party providers
- We do not promote or encourage illegal streaming
- This project is a technical demonstration and learning resource
- Users must comply with their local copyright laws
- We are not responsible for third-party content

## Overview

Nova is a versatile streaming platform designed to bring you a diverse collection of movies right to your fingertips. Whether you're into the latest blockbusters or timeless classics, Nova has something for everyone.

## Project Status

🚧 **Currently Under Active Development** 🚧

Progress Overview:
- [x] Core streaming functionality
- [x] Basic UI implementation
- [x] Search and filtering
- [ ] Advanced filters dropdown (Low Priority)
- [ ] Poster images restoration (High Priority)
- [ ] TV Shows functionality (High Priority)
- [ ] Social features (Planned) (maybe ill make use of flixsteria as a social api endpoint for movie services) [flixsteria](https://flixsteria.com/) - that is if i every get around to making it.

## Project Structure

```
novafork/
├── src/
│   ├── assets/         # Static assets (images, etc.)
│   ├── components/     # UI components
│   │   ├── media/     # Media-related components
│   │   ├── search/    # Search functionality
│   │   ├── filters/   # Filter components
│   │   ├── ui/        # Common UI components
│   │   └── modals/    # Modal components
│   ├── services/      # Business logic and services
│   │   ├── api/       # API integration
│   │   └── utils/     # Utility functions
│   ├── styles/        # CSS styles
│   └── index.js       # Application entry point
└── index.html         # Main HTML file
```

## Current Features

✨ **Core Features**
- Modern modular architecture
- Advanced search with suggestions
- Media filtering system
- Multiple video providers
- Detailed media information
- Share functionality

🎨 **UI/UX**
- Responsive design
- Loading animations
- Error handling
- Pagination system

🔧 **Technical**
- State management
- API integration
- Modular styling
- Error boundaries

## Roadmap & Issues

### 🔴 High Priority

1. **TV Shows Display**
   - Status: Needs Improvement
   - Issue: Display page not optimized for TV shows
   - Fix: Implement proper season/episode selection
   - Add episode information display
   - Improve series navigation

2. **Hide Trending Button**
   - Status: Broken
   - Issue: Button functionality not working correctly
   - Fix: Restore hide/show trending section toggle

3. **Advanced Filters Dropdown**
   - Status: In Progress
   - Issue: Menu not displaying correctly
   - Fix: Restructure dropdown component

4. **Movie Posters**
   - Status: Broken
   - Issue: Images not loading
   - Fix: Restore image loading logic

### 🟡 Medium Priority

4. **Favorites System**
   - Local storage integration
   - Cloud sync capability
   - Custom collections support
   - Favorite shows/episodes tracking

5. **Comments System**
   - Threaded comments
   - Rating system
   - Moderation tools
   - Episode-specific comments for TV shows

### 🟢 Future Enhancements

6. **Watch Party**
   - Synchronized playback
   - Real-time chat
   - User presence system
   - TV show episode sync support

7. **Code Improvements**
   - Further modularization
   - Performance optimization
   - Testing implementation
   - Documentation updates

## Quick Start

```bash
# Clone repository
git clone https://github.com/Flixsteria/novafork.git

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## Development Guidelines

- Use ESLint for code quality
- Follow modular component structure
- Implement error boundaries
- Write unit tests for new features
- Document API integrations

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Submit pull request

## Credits

- Original novafork by [Noname25495](https://github.com/noname25495)
- Nova concept by [ambr0sial](https://github.com/ambr0sial)
- TMDB API integration

## Disclaimer

This project is a fork of novafork, created for educational purposes. All credit for the original concept and base implementation goes to the novafork team. The developers of this project do not host, distribute, or promote any copyrighted content. All media is sourced from third-party providers, and users are solely responsible for ensuring their use complies with applicable laws.
