<p align="center">
  <strong>Nova</strong> – Your Gateway to Free Streaming
</p>

> **just got bored tbh, use the real novafork**

# Nova ☄

## Overview

Nova is a versatile streaming platform designed to bring you a diverse collection of movies right to your fingertips. Whether you're into the latest blockbusters or timeless classics, Nova has something for everyone.

## Project Structure

```
novafork/
├── src/
│   ├── assets/         # Static assets (images, etc.)
│   ├── components/     # UI components
│   │   ├── media/     # Media-related components
│   │   ├── search/    # Search functionality
│   │   ├── filters/   # Filter components
│   │   └── modals/    # Modal components
│   ├── services/      # Business logic and services
│   │   ├── api/       # API integration
│   │   └── utils/     # Utility functions
│   ├── styles/        # CSS styles
│   ├── config/        # Configuration files
│   └── index.js       # Application entry point
├── index.html         # Main HTML file
├── package.json       # Project configuration
└── README.md         # Project documentation
```

## Features

- Modern modular architecture
- Cyberpunk-themed UI
- Advanced search functionality
- Media filtering system
- Responsive design
- State management
- Error handling

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/flixsteria/novafork.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Development

- Components are modular and self-contained
- State management is handled through stateManager.js
- API calls are centralized in tmdbService.js
- Styles are organized in src/styles/main.css

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original project by Ambrosial
- TMDB for the movie database API
