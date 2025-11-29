# Dynamic Live YouTube Overlay

A React-based interactive overlay for YouTube livestreams, featuring real-time chat integration, Text-to-Speech (TTS) using Cartesia, and a divine spiritual aesthetic.

## Features

- **Real-time Chat Integration**: Fetches live chat messages from YouTube.
- **Text-to-Speech (TTS)**: Converts chat messages to speech using the Cartesia API.
- **Divine Aesthetic**: Features a spiritual theme with particle effects and background music.
- **Interactive Control Panel**: Settings to control TTS, audio volume, and other parameters.
- **Chat Polling**: Efficiently polls for new messages.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- YouTube Data API Key
- Cartesia API Key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sidharth-n/dynamic-live-youtube.git
   cd dynamic-live-youtube
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_CARTESIA_API_KEY=your_cartesia_api_key
VITE_VIDEO_URL=https://www.youtube.com/watch?v=your_video_id
VITE_CHANNEL_ID=your_channel_id
```

- `VITE_YOUTUBE_API_KEY`: Your Google Cloud Project API key with YouTube Data API v3 enabled.
- `VITE_CARTESIA_API_KEY`: API key from Cartesia for TTS services.
- `VITE_VIDEO_URL`: The URL of the YouTube video/livestream to monitor.
- `VITE_CHANNEL_ID`: The ID of the YouTube channel.

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

3. Use the settings panel (gear icon) to configure the overlay behavior.

## Technologies Used

- **React**: UI library
- **TypeScript**: Static typing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Axios**: HTTP client
- **Cartesia**: Text-to-Speech API

## License

[MIT](LICENSE)
